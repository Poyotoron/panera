import type { DetectedPanel, RecognitionResult } from "../types";
import { DIFFICULTY_CONFIG } from "../data/difficultyConfig";

type DifficultyKey = keyof typeof DIFFICULTY_CONFIG;

type CellData = {
  row: number;
  col: number;
  imageData: ImageData;
  signature: CellSignature;
};

type CellSignature = {
  grayscale: number[];
  avgColor: RGB;
};

type RGB = { r: number; g: number; b: number };

type HSV = { h: number; s: number; v: number };

export class PanelRecognizer {
  private difficulty: DifficultyKey;
  private gridSize: { rows: number; cols: number };

  constructor(difficulty: DifficultyKey) {
    this.difficulty = difficulty;
    this.gridSize = DIFFICULTY_CONFIG[difficulty];
  }

  async recognizeFromImage(imageFile: File): Promise<RecognitionResult> {
    const startTime = performance.now();
    try {
      const image = await this.loadImage(imageFile);
      const gridRegion = this.detectGridRegion(image);
      const cells = this.extractCells(image, gridRegion);
      const panels = this.classifyDetectedPanels(cells);
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

  private extractCells(
    image: ImageData,
    region: { x: number; y: number; width: number; height: number },
  ) {
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
        const signature = this.buildSignature(cellImageData);
        cells.push({ row, col, imageData: cellImageData, signature });
      }
    }

    return cells;
  }

  private extractRegion(
    source: ImageData,
    x: number,
    y: number,
    width: number,
    height: number,
  ): ImageData {
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

  private classifyDetectedPanels(cells: CellData[]): DetectedPanel[] {
    const { pairs, singles } = this.buildPrizePairs(cells);
    const panels: DetectedPanel[] = [];
    const prizeLabels = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"];

    pairs.forEach((pair, index) => {
      const label = prizeLabels[index] ?? "A";
      pair.members.forEach((member) => {
        panels.push({
          position: { row: member.row, col: member.col },
          type: "prize",
          label,
          confidence: pair.confidence,
        });
      });
    });

    singles.forEach((member) => {
      const type = this.classifySpecialPanel(member.signature.avgColor);
      panels.push({
        position: { row: member.row, col: member.col },
        type,
        label: type === "chance" ? "+" : "-",
        confidence: 0.8,
      });
    });

    return panels;
  }

  private buildPrizePairs(cells: CellData[]) {
    const pairCount = DIFFICULTY_CONFIG[this.difficulty].prizes;
    const candidates: { i: number; j: number; distance: number }[] = [];

    for (let i = 0; i < cells.length; i += 1) {
      for (let j = i + 1; j < cells.length; j += 1) {
        candidates.push({
          i,
          j,
          distance: this.signatureDistance(
            cells[i].signature,
            cells[j].signature,
          ),
        });
      }
    }

    candidates.sort((a, b) => a.distance - b.distance);

    const used = new Set<number>();
    const pairs: { members: [CellData, CellData]; confidence: number }[] = [];

    for (const candidate of candidates) {
      if (pairs.length >= pairCount) break;
      if (used.has(candidate.i) || used.has(candidate.j)) continue;
      used.add(candidate.i);
      used.add(candidate.j);
      const confidence = Math.max(0.4, 1 - candidate.distance * 2.5);
      pairs.push({
        members: [cells[candidate.i], cells[candidate.j]],
        confidence,
      });
    }

    const singles = cells.filter((_, index) => !used.has(index));
    return { pairs, singles };
  }

  private buildSignature(imageData: ImageData): CellSignature {
    const resized = this.resizeImage(imageData, 12, 12);
    const grayscale = this.toGrayscale(resized).map((value) => value / 255);
    const avgColor = this.getDominantColor(imageData);
    return { grayscale, avgColor };
  }

  private signatureDistance(a: CellSignature, b: CellSignature): number {
    const grayDistance = this.vectorDistance(a.grayscale, b.grayscale);
    const colorDistance = this.colorDistance(a.avgColor, b.avgColor);
    return grayDistance * 0.75 + colorDistance * 0.25;
  }

  private vectorDistance(a: number[], b: number[]): number {
    if (a.length !== b.length) return 1;
    let sum = 0;
    for (let i = 0; i < a.length; i += 1) {
      const diff = a[i] - b[i];
      sum += diff * diff;
    }
    return Math.sqrt(sum / a.length);
  }

  private colorDistance(a: RGB, b: RGB): number {
    const dr = (a.r - b.r) / 255;
    const dg = (a.g - b.g) / 255;
    const db = (a.b - b.b) / 255;
    return Math.sqrt((dr * dr + dg * dg + db * db) / 3);
  }

  private classifySpecialPanel(color?: RGB): "chance" | "shuffle" {
    if (!color) return "shuffle";
    const hsv = this.rgbToHsv(color);
    const yellowHue = 55;
    const purpleHue = 285;
    const yellowScore = this.hueDistance(hsv.h, yellowHue) + (1 - hsv.s) * 40;
    const purpleScore = this.hueDistance(hsv.h, purpleHue) + (1 - hsv.s) * 40;
    return yellowScore <= purpleScore ? "chance" : "shuffle";
  }

  private hueDistance(a: number, b: number): number {
    const diff = Math.abs(a - b);
    return Math.min(diff, 360 - diff);
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

  private resizeImage(
    imageData: ImageData,
    newWidth: number,
    newHeight: number,
  ): ImageData {
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

  private calculateConfidence(panels: DetectedPanel[]): number {
    if (panels.length === 0) return 0;
    const avgConfidence =
      panels.reduce((sum, panel) => sum + panel.confidence, 0) / panels.length;
    const expectedCount = this.gridSize.rows * this.gridSize.cols;
    const completeness = panels.length / expectedCount;
    return avgConfidence * completeness;
  }
}
