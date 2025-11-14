async function action(params, options) {
    const res = { prompt: params.join(" ") };
    return res;
}

export { action }