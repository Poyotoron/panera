import type { DetectedPanel, RecognitionResult } from "../types";
import { DIFFICULTY_CONFIG } from "../data/difficultyConfig";

type DifficultyKey = keyof typeof DIFFICULTY_CONFIG;

type CellData = {
  row: number;
  col: number;
  imageData: ImageData;
};

type PanelGroup = {
  hash: string;
  members: CellData[];
  dominantColor?: RGB;
};

type RGB = { r: number; g: number; b: number };

type HSV = { h: number; s: number; v: number };

export class PanelRecognizer {
  private gridSize: { rows: number; cols: number };

  constructor(difficulty: DifficultyKey) {
    this.gridSize = DIFFICULTY_CONFIG[difficulty];
  }

  async recognizeFromImage(imageFile: File): Promise<RecognitionResult> {
    const startTime = performance.now();
    try {
      const image = await this.loadImage(imageFile);
      const gridRegion = this.detectGridRegion(image);
      const cells = this.extractCells(image, gridRegion);
      const groups = await this.groupSimilarCells(cells);
      const panels = this.classifyPanelGroups(groups);
      const confidence = this.calculateConfidence(panels);
      return {
        success: true,
        confidence,
        panels,
        processingTime: performance.now() - startTime,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return {
        success: false,
        confidence: 0,
        panels: [],
        errors: [message],
        processingTime: performance.now() - startTime,
      };
    }
  }

  private async loadImage(file: File): Promise<ImageData> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (event) => {
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Canvas context not available"));
            return;
          }
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, img.width, img.height);
          resolve(imageData);
        };
        img.onerror = () => reject(new Error("Image load failed"));
        img.src = String(event.target?.result ?? "");
      };

      reader.onerror = () => reject(new Error("File read failed"));
      reader.readAsDataURL(file);
    });
  }

  private detectGridRegion(image: ImageData) {
    return {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    };
  }

  private extractCells(image: ImageData, region: { x: number; y: number; width: number; height: number }) {
    const { rows, cols } = this.gridSize;
    const cellWidth = region.width / cols;
    const cellHeight = region.height / rows;
    const cells: CellData[] = [];

    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        const x = Math.floor(region.x + col * cellWidth);
        const y = Math.floor(region.y + row * cellHeight);
        const w = Math.floor(cellWidth);
        const h = Math.floor(cellHeight);
        const cellImageData = this.extractRegion(image, x, y, w, h);
        cells.push({ row, col, imageData: cellImageData });
      }
    }

    return cells;
  }

  private extractRegion(source: ImageData, x: number, y: number, width: number, height: number): ImageData {
    const canvas = document.createElement("canvas");
    canvas.width = source.width;
    canvas.height = source.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return new ImageData(width, height);
    }
    ctx.putImageData(source, 0, 0);
    return ctx.getImageData(x, y, width, height);
  }

  private async groupSimilarCells(cells: CellData[]): Promise<PanelGroup[]> {
    const groups: PanelGroup[] = [];
    const threshold = 0.85;

    for (const cell of cells) {
      const hash = await this.calculatePerceptualHash(cell.imageData);
      let addedToGroup = false;
      for (const group of groups) {
        const similarity = this.compareHashes(hash, group.hash);
        if (similarity >= threshold) {
          group.members.push(cell);
          addedToGroup = true;
          break;
        }
      }
      if (!addedToGroup) {
        groups.push({
          hash,
          members: [cell],
          dominantColor: this.getDominantColor(cell.imageData),
        });
      }
    }

    return groups;
  }

  private async calculatePerceptualHash(imageData: ImageData): Promise<string> {
    const resized = this.resizeImage(imageData, 8, 8);
    const gray = this.toGrayscale(resized);
    const avg = this.calculateAverage(gray);
    let hash = "";
    for (let i = 0; i < gray.length; i += 1) {
      hash += gray[i] >= avg ? "1" : "0";
    }
    return hash;
  }

  private compareHashes(hash1: string, hash2: string): number {
    if (hash1.length !== hash2.length) return 0;
    let differences = 0;
    for (let i = 0; i < hash1.length; i += 1) {
      if (hash1[i] !== hash2[i]) differences += 1;
    }
    return 1 - differences / hash1.length;
  }

  private classifyPanelGroups(groups: PanelGroup[]): DetectedPanel[] {
    const panels: DetectedPanel[] = [];
    let prizeIndex = 0;
    const prizeLabels = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"];

    groups.sort((a, b) => b.members.length - a.members.length);

    for (const group of groups) {
      const groupSize = group.members.length;
      if (groupSize === 2) {
        const label = prizeLabels[prizeIndex] ?? "A";
        prizeIndex += 1;
        for (const member of group.members) {
          panels.push({
            position: { row: member.row, col: member.col },
            type: "prize",
            label,
            confidence: 0.9,
            imageHash: group.hash,
          });
        }
      } else if (groupSize === 1) {
        const member = group.members[0];
        const type = this.classifySpecialPanel(group.dominantColor);
        panels.push({
          position: { row: member.row, col: member.col },
          type,
          label: type === "chance" ? "+" : "-",
          confidence: 0.85,
          imageHash: group.hash,
        });
      }
    }

    return panels;
  }

  private classifySpecialPanel(color?: RGB): "chance" | "shuffle" {
    if (!color) return "shuffle";
    const hsv = this.rgbToHsv(color);
    if (hsv.h >= 40 && hsv.h <= 70 && hsv.s > 0.5) {
      return "chance";
    }
    if (hsv.h >= 270 && hsv.h <= 290 && hsv.s > 0.4) {
      return "shuffle";
    }
    return "shuffle";
  }

  private getDominantColor(imageData: ImageData): RGB {
    const pixels = imageData.data;
    let r = 0;
    let g = 0;
    let b = 0;
    const pixelCount = pixels.length / 4;

    for (let i = 0; i < pixels.length; i += 4) {
      r += pixels[i];
      g += pixels[i + 1];
      b += pixels[i + 2];
    }

    return {
      r: Math.round(r / pixelCount),
      g: Math.round(g / pixelCount),
      b: Math.round(b / pixelCount),
    };
  }

  private rgbToHsv(rgb: RGB): HSV {
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    let h = 0;
    if (delta !== 0) {
      if (max === r) {
        h = 60 * (((g - b) / delta) % 6);
      } else if (max === g) {
        h = 60 * ((b - r) / delta + 2);
      } else {
        h = 60 * ((r - g) / delta + 4);
      }
    }
    if (h < 0) h += 360;

    const s = max === 0 ? 0 : delta / max;
    const v = max;

    return { h, s, v };
  }

  private resizeImage(imageData: ImageData, newWidth: number, newHeight: number): ImageData {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return new ImageData(newWidth, newHeight);
    }
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    ctx.putImageData(imageData, 0, 0);

    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) {
      return new ImageData(newWidth, newHeight);
    }
    tempCanvas.width = newWidth;
    tempCanvas.height = newHeight;
    tempCtx.drawImage(canvas, 0, 0, newWidth, newHeight);
    return tempCtx.getImageData(0, 0, newWidth, newHeight);
  }

  private toGrayscale(imageData: ImageData): number[] {
    const gray: number[] = [];
    const pixels = imageData.data;
    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      gray.push(0.299 * r + 0.587 * g + 0.114 * b);
    }
    return gray;
  }

  private calculateAverage(values: number[]): number {
    const sum = values.reduce((a, b) => a + b, 0);
    return sum / values.length;
  }

  private calculateConfidence(panels: DetectedPanel[]): number {
    if (panels.length === 0) return 0;
    const avgConfidence =
      panels.reduce((sum, panel) => sum + panel.confidence, 0) / panels.length;
    const expectedCount = this.gridSize.rows * this.gridSize.cols;
    const completeness = panels.length / expectedCount;
    return avgConfidence * completeness;
  }
}
