// using jQuery



/* JavaScript for LynxTable XBlock, Studio Side. */
function HLCK5_XBlockStudio(runtime, xblock_element) {

    var isFullscreen = false;

    var sHeight = 0;
    var sWidth = "70%";
    var sTop = "15.5%";
    var sLeft = "15%";

    var modal_height_pct = 80;
    var modal_width_pct = 80;

    // button colors for the action icons
    var csxColor = [
        "#009FE6",     // inactive
        "black"        // active
        ];

    var editor_element_id = "chx_body_html";


    // **************************************************
    // LOADING CUSTOM CK BUILD SO DONT NEED TO DO THIS
    //        also code mirror isn't being used as a fallback ideally
    //        since i obviously never make mistakes... right?
    // **************************************************
    // Manually set this to where you store CKEditor
    // var CKEditor_URL = "{{ CKEDITOR_URL }}";

    // var codemirror_settings = {
        // lineNumbers: true,
        // matchBrackets: true,
        // autoCloseBrackets: true,
        // lineWrapping: true,
        // theme: "mdn-like"
    // };
    // **************************************************
    var studio_buttons = {
        "editor": "EDITOR",
        "settings": "SETTINGS",
        // "chx_tab_html": "editor",
        // "chx_tab_options": "settings",
        //"chx_fullscreen": "Max"
    };

    var ckeditor_html = "";
    var editor_html = "";
    var ckeditor_html_flag = true;

    // // Attach CKEditor to HTML input textarea
    // if (CKEditor_URL.endsWith("ckeditor.js")) {

        // $.getScript(CKEditor_URL, function () {
            // ckeditor_html = CKEDITOR.replace('chx_body_html');
            // ckeditor_html.config.height = "auto";
            // ckeditor_html.config.width = "auto";

            // ckeditor_html.config.extraPlugins = "format";
            // ckeditor_html.config.format_tags = "p;h1;h2;h3;h4;h5;h6;pre;address;div";
            // ckeditor_html.config.baseHref = "http://148.251.101.130:8001/";
            // ckeditor_html.config.resize_enabled = true;

        // });
    // }
    // else{
        // ckeditor_html_flag = false;

    // }

    if(typeof(HL_CKEDITOR) != 'undefined'){
        console.log("HL_CKEDITOR was loaded.")

        HL_CKEDITOR.default.document_editor
        //HL_CKEDITOR.default.classic_editor

            .create(document.getElementById(editor_element_id),{
                imageUploadUrl: "/assets/" + window.course.id + "/",
                csrf_token: getCookie('csrftoken'),
            }).then(editor => {

                ckeditor_html = editor

                // editor.model.document.on( 'change:data', () => {
                    // TOC_MGR.trigger_event(TOC_MGR.EVENT_TRIGGERS.EDITED_CURRENT)
                // } );

                const toolbarContainer = document.querySelector( '.document-editor__toolbar' );
                toolbarContainer.appendChild( editor.ui.view.toolbar.element );

                console.log("HL_CKEDITOR successfully initialized.");
            }).catch(err => {
                console.log(err.stack)
            });

    }else{
        alert("HL_CKEDITOR was not found!")
        ckeditor_html_flag = false;
    }

    // Use CodeMirror as a fallback
    // if (!ckeditor_html_flag) {
        // console.log("Code mirror loaded");
        // editor_html = CodeMirror.fromTextArea($('.chx_body_html')[0],
            // jQuery.extend({mode: {name: "htmlmixed", globalVars: true}}, codemirror_settings)
        // );
    // }

    function getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    function place_modal(){
        var scroll_offset = $('html').scrollTop();
        var left_margin = (100 - modal_width_pct) / 2;
        var top_margin = ((100 - modal_height_pct) / 2);

        $('.modal-window').css({
            "top": "calc(" + top_margin + "% + " + scroll_offset + "px)",
            'left': left_margin + "%" ,
            "width": modal_width_pct + "vw",
            "height": modal_height_pct + "vh"
        });

    }

    function tab_highlight(toHighlight) {
        //for (var b in studio_buttons) {
            //if (b != "chx_fullscreen") $("#" + b).css({"color": csxColor[0]});

        //}
        //$("#" + toHighlight).css({"color": csxColor[1]});

        $('.modal-window .editor-modes a').removeClass('is-set')
        $('.modal-window .editor-modes').find("#" + toHighlight).addClass('is-set');
    }

    // Hide all panes except toShow
    function tab_switch(toShow) {

        tab_highlight(toShow);
        //for (var b in studio_buttons) $("." + b).hide();
        // $("." + toShow).show();
        $('.modal_tab_view').hide()
        $('.modal_tab_view[data-mode="' + toShow + '"]').show();

        place_modal();
    }

    // Send current code and settings to the backend
    function studio_submit(commit) {

        commit = commit === undefined ? false : commit;

        $.ajax({
            type: "POST",
            url: runtime.handlerUrl(xblock_element, 'studio_submit'),
            data: JSON.stringify({
                "commit": commit.toString(),
                "display_name": $('.chx_display_name').val(),
                "body_html":
                    (ckeditor_html != "") ?
                        ckeditor_html.getData() :
                        editor_html.getDoc().getValue(),
            }) // add success state that appends preview to the DOM
        });

    }

    $(function($) {

        // Add Save Button
        $('ul', '.modal-actions')
            .prepend(
                $('<li>', {class: "action-item"}).append(
                    $('<a />', {
                        class: "action-primary",
                        id: "chx_submit",
                        text: "Save"
                    })
                )
            );

        // add actions for the top of the modal to switch views
        for (var b in studio_buttons) {
            $('.editor-modes')
                .append(
                    $('<li>', {class: "action-item"}).append(
                        $('<a />', {
                            //class: "action-primary",
                            class: b + "-button modal_tab",
                            id: b,
                            text: studio_buttons[b],
                            href: "#",
                            "data-mode":b,
                        })
                    )
                );
        }

        // Set main pane to Options
        tab_switch("editor");

        // Readjust modal window dimensions in case the browser window is resized
        window.addEventListener('resize', function() {
            place_modal();
        });

        // reposition modal on window scroll
        window.addEventListener('scroll', function() {
            place_modal();
        });

        $('.modal-window .editor-modes a').click(function(){
            tab_switch($(this).attr('data-mode'));
        });

        // $('#chx_tab_options').click(function() {
        //     tab_switch("chx_tab_options");
        // });
        //
        // $('#chx_tab_html').click(function() {
        //     tab_switch("chx_tab_html");
        // });

        // Fill the window with the Editor view
        // $('#chx_fullscreen').click(function() {
        //     isFullscreen = !isFullscreen;
        //
        // });

        // Clicked Save button
        $('#chx_submit').click(function(eventObject) {
            studio_submit(true);
            setTimeout(function(){location.reload();},200);
        });

    });

}
