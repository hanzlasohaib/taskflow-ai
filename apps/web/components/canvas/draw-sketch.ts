import type { SketchDocument, SketchStroke } from "@taskflow/types";

export function drawStroke(
  ctx: CanvasRenderingContext2D,
  stroke: SketchStroke,
  width: number,
  height: number,
) {
  if (stroke.points.length === 0) return;
  ctx.strokeStyle = stroke.color;
  ctx.lineWidth = stroke.width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  const first = stroke.points[0]!;
  ctx.moveTo(first.x * width, first.y * height);
  for (let i = 1; i < stroke.points.length; i++) {
    const point = stroke.points[i]!;
    ctx.lineTo(point.x * width, point.y * height);
  }
  ctx.stroke();
}

export function drawSketchDocument(ctx: CanvasRenderingContext2D, document: SketchDocument) {
  ctx.clearRect(0, 0, document.width, document.height);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, document.width, document.height);
  for (const stroke of document.strokes) {
    drawStroke(ctx, stroke, document.width, document.height);
  }
}
