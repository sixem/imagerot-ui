export const truncateString = (input: string, maxLength: number = 32) => {
    const partLength = Math.floor(maxLength / 2);

    if (input.length <= maxLength) {
        return input;
    }

    const [a, b] = [
        input.substring(0, partLength),
        input.substring(input.length - partLength, input.length)
    ];

    return `${a} ... ${b}`;
};
