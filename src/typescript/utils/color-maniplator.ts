interface RgbHexColor {
    red: string;
    green: string;
    blue: string;
}

interface RgbDecimalColor {
    red: number;
    green: number;
    blue: number;
}

export class ColorManipulator {
    darken(hexColor: string, percentage: number) {
        if (6 !== hexColor.length) {
            return hexColor;
        }

        const rgbHexColor = this.getRgbHexColorFromString(hexColor);
        const rgbDecimalColor = this.hexToRgbDecimalColor(rgbHexColor);
        this.applyPercentageToRgbColor(rgbDecimalColor, -percentage);
        const newRgbHexColor = this.decimalToRgbHexColor(rgbDecimalColor);

        return this.getHexStringFromRgbHexColor(newRgbHexColor);
    }

    private getRgbHexColorFromString(hexColor: string): RgbHexColor {
        return {
            red: hexColor.substr(0, 2),
            green: hexColor.substr(2, 2),
            blue: hexColor.substr(4, 2),
        };
    }

    private hexToRgbDecimalColor(rgbHexColor: RgbHexColor): RgbDecimalColor {
        return {
            red: parseInt(rgbHexColor.red, 16),
            green: parseInt(rgbHexColor.green, 16),
            blue: parseInt(rgbHexColor.blue, 16),
        };
    }

    private applyPercentageToRgbColor(rgbColor: RgbDecimalColor, percentage: number) {
        if (0 == percentage) {
            return;
        }

        const ratio = 1 + (percentage / 100);

        rgbColor.red = (rgbColor.red * ratio) | 0;
        rgbColor.green = (rgbColor.green * ratio) | 0;
        rgbColor.blue = (rgbColor.blue * ratio) | 0;

        rgbColor.red = Math.max(0, Math.min(255, rgbColor.red));
        rgbColor.green = Math.max(0, Math.min(255, rgbColor.green));
        rgbColor.blue = Math.max(0, Math.min(255, rgbColor.blue));
    }

    private decimalToRgbHexColor(rgbDecimalColor: RgbDecimalColor): RgbHexColor {
        return {
            red: this.padHexColor(rgbDecimalColor.red.toString(16)),
            green: this.padHexColor(rgbDecimalColor.green.toString(16)),
            blue: this.padHexColor(rgbDecimalColor.blue.toString(16)),
        };
    }

    private padHexColor(hexColor: string) {
        if (1 == hexColor.length) {
            hexColor = `0${hexColor}`;
        }

        return hexColor;
    }

    private getHexStringFromRgbHexColor(rgbHexColor: RgbHexColor): string {
        return rgbHexColor.red + rgbHexColor.green + rgbHexColor.blue;
    }
}
