export const getAverage = (array: number[]) => {
    return array.reduce((a, b) => a + b) / array.length;
};
