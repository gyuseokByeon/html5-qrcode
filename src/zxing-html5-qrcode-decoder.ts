/**
 * @fileoverview
 * {@interface QrcodeDecoder} wrapper around ZXing library.
 * 
 * @author mebjas <minhazav@gmail.com>
 * 
 * ZXing library forked from https://github.com/zxing-js/library.
 * 
 * The word "QR Code" is registered trademark of DENSO WAVE INCORPORATED
 * http://www.denso-wave.com/qrcode/faqpatent-e.html
 */

import {
    QrcodeResult,
    Html5QrcodeSupportedFormats,
    QrcodeDecoder
} from "./core";

// Ambient tag to refer to ZXing library.
declare const ZXing: any;

/**
 * ZXing based Code decoder.
 */
export class ZXingHtml5QrcodeDecoder implements QrcodeDecoder {

    private static formatMap: Map<Html5QrcodeSupportedFormats, any>
        = new Map([
            [Html5QrcodeSupportedFormats.QR_CODE, ZXing.BarcodeFormat.QR_CODE ],
            [Html5QrcodeSupportedFormats.AZTEC, ZXing.BarcodeFormat.AZTEC ],
            [Html5QrcodeSupportedFormats.CODABAR, ZXing.BarcodeFormat.CODABAR ],
            [Html5QrcodeSupportedFormats.CODE_39, ZXing.BarcodeFormat.CODE_39 ],
            [Html5QrcodeSupportedFormats.CODE_93, ZXing.BarcodeFormat.CODE_93 ],
            [
                Html5QrcodeSupportedFormats.CODE_128,
                ZXing.BarcodeFormat.CODE_128 ],
            [
                Html5QrcodeSupportedFormats.DATA_MATRIX,
                ZXing.BarcodeFormat.DATA_MATRIX ],
            [
                Html5QrcodeSupportedFormats.MAXICODE,
                ZXing.BarcodeFormat.MAXICODE ],
            [Html5QrcodeSupportedFormats.ITF, ZXing.BarcodeFormat.ITF ],
            [Html5QrcodeSupportedFormats.EAN_13, ZXing.BarcodeFormat.EAN_13 ],
            [Html5QrcodeSupportedFormats.EAN_8, ZXing.BarcodeFormat.EAN_8 ],
            [Html5QrcodeSupportedFormats.PDF_417, ZXing.BarcodeFormat.PDF_417 ],
            [Html5QrcodeSupportedFormats.RSS_14, ZXing.BarcodeFormat.RSS_14 ],
            [
                Html5QrcodeSupportedFormats.RSS_EXPANDED,
                ZXing.BarcodeFormat.RSS_EXPANDED ],
            [Html5QrcodeSupportedFormats.UPC_A, ZXing.BarcodeFormat.UPC_A ],
            [Html5QrcodeSupportedFormats.UPC_E, ZXing.BarcodeFormat.UPC_E ],
            [
                Html5QrcodeSupportedFormats.UPC_EAN_EXTENSION,
                ZXing.BarcodeFormat.UPC_EAN_EXTENSION ]
        ]);

    private hints: Map<any, any>;
    private verbose: boolean;

    public constructor(
        requestedFormats: Array<Html5QrcodeSupportedFormats>,
        verbose: boolean) {
        if (!ZXing) {
            throw 'Use html5qrcode.min.js without edit, ZXing not found.';
        }
        this.verbose = verbose;

        const formats = this.createZXingFormats(requestedFormats);
        const hints = new Map();
        hints.set(ZXing.DecodeHintType.POSSIBLE_FORMATS, formats);
        this.hints = hints;
    }

    decode(canvas: HTMLCanvasElement): QrcodeResult {
        // Note: Earlier we used to instantiate the zxingDecoder once as state
        // of this class and use it for each scans. There seems to be some
        // stateful bug in ZXing library around RSS_14 likely due to
        // https://github.com/zxing-js/library/issues/211.
        // Recreating a new instance per scan doesn't lead to performance issues
        // and temporarily mitigates this issue.
        // TODO(mebjas): Properly fix this issue in ZXing library.
        const zxingDecoder = new ZXing.MultiFormatReader(
            this.verbose, this.hints);
        const luminanceSource
            = new ZXing.HTMLCanvasElementLuminanceSource(canvas);
        const binaryBitmap
            = new ZXing.BinaryBitmap(
                new ZXing.HybridBinarizer(luminanceSource));
        let result = zxingDecoder.decode(binaryBitmap);
        return {
            text: result.text
        };
    }

    private createZXingFormats(
        requestedFormats: Array<Html5QrcodeSupportedFormats>):
        Array<any> {
            let zxingFormats = [];
            for (const requestedFormat of requestedFormats) {
                if (ZXingHtml5QrcodeDecoder.formatMap.has(requestedFormat)) {
                    zxingFormats.push(
                        ZXingHtml5QrcodeDecoder.formatMap.get(
                            requestedFormat));
                } else {
                    console.error(`${requestedFormat} is not supported by`
                        + "ZXingHtml5QrcodeShim");
                }
            }
            return zxingFormats;
    }
}
