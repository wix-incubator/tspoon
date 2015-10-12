
export default function binarySearch(array: number[], value: number): number {
    let low = 0;
    let high = array.length - 1;
    while (low <= high) {
        let middle = low + ((high - low) >> 1);
        let midValue = array[middle];
        if (midValue === value) {
            return middle;
        } else if (midValue > value) {
            high = middle - 1;
        } else {
            low = middle + 1;
        }
    }
    return low - 1; // the last middle
}
