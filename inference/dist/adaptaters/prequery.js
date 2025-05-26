async function action(params, options) {
    const res = { prompt: params.args.join(" ") };
    return res;
}

export { action }