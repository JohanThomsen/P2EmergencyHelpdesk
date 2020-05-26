const search = require('../dataSorting.js');

let mergeTestArraySorted = {
    data:  [
        {
            coordinates: [57, 10]
        },
        {
            coordinates: [58, 10]
        },
        {
            coordinates: [59, 10]
        },
        {
            coordinates: [60, 10]
        },
        {
            coordinates: [61, 10]
        },
        {
            coordinates: [62, 10]
        }
    ]
}

let mergeTestArraySortedInput = {
    data:  [
        {
            coordinates: [57, 10]
        },
        {
            coordinates: [58, 10]
        },
        {
            coordinates: [58.5, 10]
        },
        {
            coordinates: [59, 10]
        },
        {
            coordinates: [60, 10]
        },
        {
            coordinates: [61, 10]
        },
        {
            coordinates: [62, 10]
        }
    ]
}

let mergeTestArrayUnSorted = {
    data:  [
        {
            coordinates: [58, 10]
        },
        {
            coordinates: [57, 10]
        },
        {
            coordinates: [62, 10]
        },
        {
            coordinates: [59, 10]
        },
        {
            coordinates: [61, 10]
        },
        {
            coordinates: [60, 10]
        }
    ]
}

test('Sorts an unsorted Array using mergeSort', () => {
    expect(search.mergeSort(mergeTestArrayUnSorted.data)).toStrictEqual(mergeTestArraySorted.data);
});

test('Input a new Oplan via Coordinates into a sorted array', () => {
    expect(search.binaryInput({coordinates: [58.5, 10]}, mergeTestArraySorted.data, 58.5, 10)).toStrictEqual(mergeTestArraySortedInput.data);
});

test('Searches for a specific coordinate in an array', () => {
    expect(search.binarySearch(mergeTestArraySortedInput.data, 59, 10)).toBe(3);
});