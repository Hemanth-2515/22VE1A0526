
const store = {};

exports.saveUrl = (code, data) => {
    store[code] = data;
};

exports.getUrl = (code) => store[code];

exports.Clicks = (code, clickData) => {
    if (store[code]) {
        store[code].clicks += 1;
        store[code].clickData.push(clickData);
    }
};
