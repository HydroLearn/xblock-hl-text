/* JavaScript for HydroLearn's text editor XBlock, LMS Side. */
function HLCK5_XBlock(runtime, xblock_element) {

    $(function ($) {
		// runtime code for loading the xblock in the LMS portion of the site
		// 		i.e. the student view initalization

        // render included mathjax
        MathJax.Hub.Queue(["Typeset", MathJax.Hub, "ck-content"]);

        // run styling for codeblocks in HL_Text blocks
        // hljs.initHighlightingOnLoad();
        
        // potential piecemeal code block highlighting
        $(xblock_element).get(0).querySelectorAll('pre code').forEach((block) => {
            hljs.highlightBlock(block);
          });
    });
}
