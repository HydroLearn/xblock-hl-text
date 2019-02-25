/* JavaScript for HydroLearn's text editor XBlock, LMS Side. */
function HLCK5_XBlock(runtime, xblock_element) {

    $(function ($) {
		// runtime code for loading the xblock in the LMS portion of the site
		// 		i.e. the student view initalization

        // render included mathjax
        MathJax.Hub.Queue(["Typeset", MathJax.Hub, "ck-content"]);
    });
}
