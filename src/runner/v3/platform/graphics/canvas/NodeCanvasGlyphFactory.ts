import type { akashicEngine as g } from "../../../engineFiles";
import type { NodeCanvasFactory } from "../../NodeCanvasFactory";
import { NodeCanvasGlyph } from "./NodeCanvasGlyph";
import { NodeCanvasSurface } from "./NodeCanvasSurface";
import type { ImageData } from "./types";

interface GlyphRenderSurfaceResult {
	surface: NodeCanvasSurface;
	advanceWidth: number;
	imageData: ImageData | null;
}

function createGlyphRenderedSurface(
	canvasFactory: NodeCanvasFactory,
	code: number,
	fontSize: number,
	cssFontFamily: string,
	baselineHeight: number,
	marginW: number,
	marginH: number,
	needImageData: boolean,
	fontColor: string,
	strokeWidth: number,
	strokeColor: string,
	strokeOnly: boolean,
	fontWeight: g.FontWeightString
): GlyphRenderSurfaceResult {
	// 要求されたフォントサイズが描画可能な最小フォントサイズ以下だった場合、必要なスケーリング係数
	const scale =
		fontSize < NodeCanvasGlyphFactory._environmentMinimumFontSize ? fontSize / NodeCanvasGlyphFactory._environmentMinimumFontSize : 1;

	const surfaceWidth = Math.ceil((fontSize + marginW * 2) * scale);
	const surfaceHeight = Math.ceil((fontSize + marginH * 2) * scale);

	// NOTE: canvasを直接操作する
	// 理由:
	// * Renderer#drawSystemText()を廃止または非推奨にしたいのでそれを用いず文字列を描画する
	// * RenderingHelperがcontextの状態を復帰するためTextMetricsを取れない
	const canvas = canvasFactory.createCanvas(surfaceWidth, surfaceHeight);
	const context = canvas.getContext("2d");

	const str = code & 0xffff0000 ? String.fromCharCode((code & 0xffff0000) >>> 16, code & 0xffff) : String.fromCharCode(code);
	const fontWeightValue = fontWeight === "bold" ? "bold " : "";

	context.save();

	// CanvasRenderingContext2D.font
	// see: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/font
	// > This string uses the same syntax as the CSS font specifier. The default font is 10px sans-serif.
	context.font = fontWeightValue + fontSize + "px " + cssFontFamily;

	context.textAlign = "left";
	context.textBaseline = "alphabetic";
	context.lineJoin = "bevel";

	// 描画可能な最小フォントサイズ以下のフォントサイズはスケーリングで実現する
	if (scale !== 1) context.scale(scale, scale);

	if (strokeWidth > 0) {
		context.lineWidth = strokeWidth;
		context.strokeStyle = strokeColor;
		context.strokeText(str, marginW, marginH + baselineHeight);
	}

	if (!strokeOnly) {
		context.fillStyle = fontColor;
		context.fillText(str, marginW, marginH + baselineHeight);
	}

	const advanceWidth = context.measureText(str).width;

	context.restore();

	const result = {
		surface: new NodeCanvasSurface(canvas),
		advanceWidth: advanceWidth,
		imageData: needImageData ? context.getImageData(0, 0, canvas.width, canvas.height) : null
	};

	return result;
}

function calcGlyphArea(imageData: ImageData): g.GlyphArea {
	let sx = imageData.width;
	let sy = imageData.height;
	let ex = 0;
	let ey = 0;
	let currentPos = 0;

	for (let y = 0, height = imageData.height; y < height; y = (y + 1) | 0) {
		for (let x = 0, width = imageData.width; x < width; x = (x + 1) | 0) {
			const a = imageData.data[currentPos + 3]; // get alpha value
			if (a !== 0) {
				if (x < sx) {
					sx = x;
				}
				if (x > ex) {
					ex = x;
				}
				if (y < sy) {
					sy = y;
				}
				if (y > ey) {
					ey = y;
				}
			}
			currentPos += 4; // go to next pixel
		}
	}

	let glyphArea: g.GlyphArea;
	if (sx === imageData.width) {
		// 空白文字
		glyphArea = { x: 0, y: 0, width: 0, height: 0 }; // 空の領域に設定
	} else {
		// sx, sy, ex, eyは座標ではなく画素のメモリ上の位置を指す添字。
		// 故にwidth, heightを算出する時 1 加算する。
		glyphArea = { x: sx, y: sy, width: ex - sx + 1, height: ey - sy + 1 };
	}

	return glyphArea;
}

function isGlyphAreaEmpty(glyphArea: g.GlyphArea): boolean {
	return glyphArea.width === 0 || glyphArea.height === 0;
}

// ジェネリックフォントファミリとして定義されているキーワードのリスト
// see: https://developer.mozilla.org/en-US/docs/Web/CSS/font-family
const genericFontFamilyNames = ["serif", "sans-serif", "monospace", "cursive", "fantasy", "system-ui"];

// ジェネリックフォントファミリでない時クォートする。
// > Font family names must either be given quoted as strings, or unquoted as a sequence of one or more identifiers.
// > Generic family names are keywords and must not be quoted.
// see: https://developer.mozilla.org/en-US/docs/Web/CSS/font-family
function quoteIfNotGeneric(name: string): string {
	if (genericFontFamilyNames.indexOf(name) !== -1) {
		return name;
	} else {
		return `"${name}"`;
	}
}

function fontFamily2CSSFontFamily(fontFamily: string | string[]): string {
	if (typeof fontFamily === "string") {
		return quoteIfNotGeneric(fontFamily);
	} else {
		return fontFamily
			.map((font) => {
				if (typeof font === "string") {
					return quoteIfNotGeneric(font);
				} else {
					return font;
				}
			})
			.join(",");
	}
}

export class NodeCanvasGlyphFactory implements g.GlyphFactory {
	/**
	 * 実行環境が描画可能な最小フォントサイズ
	 */
	static _environmentMinimumFontSize: number;

	fontFamily: string | string[];
	fontSize: number;
	baselineHeight: number;
	fontColor: string;
	fontWeight: g.FontWeightString;
	strokeWidth: number;
	strokeColor: string;
	strokeOnly: boolean;

	_glyphAreas: { [key: number]: g.GlyphArea };
	_marginW: number;
	_marginH: number;

	_cssFontFamily: string;
	_canvasFactory: NodeCanvasFactory;

	constructor(
		canvasFactory: NodeCanvasFactory,
		fontFamily: string | string[],
		fontSize: number,
		baselineHeight: number = fontSize,
		fontColor: string = "black",
		strokeWidth: number = 0,
		strokeColor: string = "black",
		strokeOnly: boolean = false,
		fontWeight: g.FontWeightString = "normal"
	) {
		this.fontFamily = fontFamily;
		this.fontSize = fontSize;
		this.fontWeight = fontWeight;
		this.baselineHeight = baselineHeight;
		this.fontColor = fontColor;
		this.strokeWidth = strokeWidth;
		this.strokeColor = strokeColor;
		this.strokeOnly = strokeOnly;
		this._canvasFactory = canvasFactory;
		this._glyphAreas = {};
		this._cssFontFamily = fontFamily2CSSFontFamily(fontFamily);

		// Akashicエンジンは指定されたフォントに利用可能なものが見つからない時
		// `g.FontFamily.SansSerif` を利用する、と仕様して定められている。
		const fallbackFontFamilyName = "sans-serif";
		if (this._cssFontFamily.indexOf(fallbackFontFamilyName) === -1) {
			this._cssFontFamily += "," + fallbackFontFamilyName;
		}

		// `this.fontSize`の大きさの文字を描画するためのサーフェスを生成する。
		// 一部の文字は縦横が`this.fontSize`幅の矩形に収まらない。
		// そこで上下左右にマージンを設ける。マージン幅は`this.fontSize`に
		// 0.3 を乗じたものにする。0.3に確たる根拠はないが、検証した範囲では
		// これで十分であることを確認している。
		//
		// strokeWidthサポートに伴い、輪郭線の厚みを加味している。
		this._marginW = Math.ceil(this.fontSize * 0.3 + this.strokeWidth / 2);
		this._marginH = Math.ceil(this.fontSize * 0.3 + this.strokeWidth / 2);

		if (NodeCanvasGlyphFactory._environmentMinimumFontSize === undefined) {
			NodeCanvasGlyphFactory._environmentMinimumFontSize = this.measureMinimumFontSize();
		}
	}

	create(code: number): g.Glyph {
		let result: GlyphRenderSurfaceResult | null = null;
		let glyphArea = this._glyphAreas[code];

		if (!glyphArea) {
			result = createGlyphRenderedSurface(
				this._canvasFactory,
				code,
				this.fontSize,
				this._cssFontFamily,
				this.baselineHeight,
				this._marginW,
				this._marginH,
				true,
				this.fontColor,
				this.strokeWidth,
				this.strokeColor,
				this.strokeOnly,
				this.fontWeight
			);
			glyphArea = calcGlyphArea(result.imageData!); // NOTE: `needImageData` が true のため必ず真
			glyphArea.advanceWidth = result.advanceWidth;
			this._glyphAreas[code] = glyphArea;
		}

		if (isGlyphAreaEmpty(glyphArea)) {
			if (result) {
				result.surface.destroy();
			}
			return new NodeCanvasGlyph(code, 0, 0, 0, 0, 0, 0, glyphArea.advanceWidth, undefined!, true);
		} else {
			// g.Glyphに格納するサーフェスを生成する。
			// glyphAreaはサーフェスをキャッシュしないため、描画する内容を持つグリフに対しては
			// サーフェスを生成する。もし前段でcalcGlyphArea()のためのサーフェスを生成して
			// いればここでは生成せずにそれを利用する。
			if (!result) {
				result = createGlyphRenderedSurface(
					this._canvasFactory,
					code,
					this.fontSize,
					this._cssFontFamily,
					this.baselineHeight,
					this._marginW,
					this._marginH,
					false,
					this.fontColor,
					this.strokeWidth,
					this.strokeColor,
					this.strokeOnly,
					this.fontWeight
				);
			}
			return new NodeCanvasGlyph(
				code,
				glyphArea.x,
				glyphArea.y,
				glyphArea.width ?? 0,
				glyphArea.height ?? 0,
				glyphArea.x - this._marginW,
				glyphArea.y - this._marginH,
				glyphArea.advanceWidth,
				result.surface,
				true
			);
		}
	}

	// 実行環境の描画可能なフォントサイズの最小値を返す
	measureMinimumFontSize(): number {
		let fontSize = 1;
		const str = "M";
		const canvas = this._canvasFactory.createCanvas(50, 50);
		const context = canvas.getContext("2d");
		if (context == null) {
			throw new Error("cannot get canvas context");
		}
		context.textAlign = "left";
		context.textBaseline = "alphabetic";
		context.lineJoin = "bevel";

		let preWidth: number;
		context.font = fontSize + "px sans-serif";
		let width = context.measureText(str).width;

		do {
			preWidth = width;
			fontSize += 1;
			context.font = fontSize + "px sans-serif";
			width = context.measureText(str).width;
		} while (preWidth === width || fontSize > 50); // フォントサイズに対応しない動作環境の場合を考慮して上限値を設ける
		return fontSize;
	}
}
