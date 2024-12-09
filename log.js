//<script>
log = (() => {
    try {
        if(NOLOG) return ()=>{};
    } catch(e) {
        return console.log.bind(console);
    }
})();