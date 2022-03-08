/**
 *
 *
 * @param {String} hex
 * @return {Uint8Array} 
 */
function hex_to_bytes(hex) {
    var typedArray = new Uint8Array(
        hex.match(/[\da-f]{2}/gi).map(function (h) {
            return parseInt(h, 16);
        })
    );
    return typedArray;
}
/**
 *
 *
 * @param {Uint8Array} bytes
 * @return {String} 
 */
function bytes_to_hex(bytes) {
    return Array.from(bytes, function (byte) {
        return ("0" + (byte & 0xff).toString(16)).slice(-2);
    }).join("");
}

/**
 *
 *
 * @class Range
 */
class Range {

    /**
     * Creates an instance of Range.
     * @param {*} from
     * @param {*} to
     * @memberof Range
     */
    constructor(from, to) {
        // Store the start and end points (state) of this new range object.
        // These are noninherited properties that are unique to this object.
        this.from = from;
        this.to = to;
    }

    // Return true if x is in the range, false otherwise
    // This method works for textual and Date ranges as well as numeric.


    /**
     *
     *
     * @param {*} x
     * @return {*} 
     * @memberof Range
     */
    includes(x) { return this.from <= x && x <= this.to; }


    // Return a string representation of the range


    /**
     *
     *
     * @return {*} 
     * @memberof Range
     */
    toString() { return `(${this.from}...${this.to})`; }
}


/**
 *
 *
 * @class Span
 * @extends {Range}
 */
class Span extends Range {
    constructor(start, length) {
        if (length >= 0) {
            super(start, start + length);
        } else {
            super(start + length, start);
        }
    }
}

/** @type {*} */
const PI = Math.PI;

/**
 * shshsh
 * 
 * @export
 * @param {*} d
 * @return {*} 
 */
function degreesToRadians(d) { return d * PI / 180; }


/**
 * hello
 *
 * @export
 * @class Circle
 */
class Circle {

    /**
     * Creates an instance of Circle.
     * @param {*} r
     * @memberof Circle
     */
    constructor(r) { this.r = r; }

    /**
     *
     *
     * @return {*} 
     * @memberof Circle
     */
    area() { return PI * this.r * this.r; }
}
