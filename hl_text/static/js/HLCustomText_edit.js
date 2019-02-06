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

    var editor_element_id = "HL_Text_editorBody";


    // Define mapping of tabs (modes) to display names
    var studio_buttons = {
        "editor": "EDITOR",
        "settings": "SETTINGS",
    };

    var ckeditor_html = "";
    var editor_html = "";
    var ckeditor_html_flag = true;

    if(typeof(HL_CKEDITOR) != 'undefined'){
        console.log("HL_CKEDITOR was loaded.")

        //HL_CKEDITOR.default.classic_editor
        HL_CKEDITOR.default.document_editor
            .create(document.getElementById(editor_element_id),{
                imageUploadUrl: "/assets/" + window.course.id + "/",
                csrf_token: getCookie('csrftoken'),
            }).then(editor => {

                ckeditor_html = editor

                // sample binding on data changed action
                // editor.model.document.on( 'change:data', () => {
                    // TOC_MGR.trigger_event(TOC_MGR.EVENT_TRIGGERS.EDITED_CURRENT)
                // } );

                const toolbarContainer = document.querySelector( '.document-editor__toolbar' );
                toolbarContainer.appendChild( editor.ui.view.toolbar.element );

                console.log("HL_CKEDITOR successfully initialized.");
            }).catch(err => {
                console.log("HL_CKEDITOR initialization Failed!");
                console.log(err.stack);
            });

    }else{
        alert("HL_CKEDITOR was not found!")
        ckeditor_html_flag = false;
    }


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
        $('.modal-window .editor-modes .modal_tab').removeClass('is-set');
        $('.modal-window .editor-modes .modal_tab[data-mode="' + toHighlight + '"]').addClass('is-set');
    }

    // Hide all panes except toShow
    function tab_switch(toShow) {

        tab_highlight(toShow);

        $('.modal-window .modal_tab_view').hide()
        $('.modal-window .modal_tab_view[data-mode="' + toShow + '"]').show();

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
        for (var mode in studio_buttons) {
            $('.editor-modes')
                .append(
                    $('<li>', {class: "action-item"}).append(
                        $('<a />', {
                            //class: "action-primary",
                            class: mode + "-button modal_tab",
                            //id: mode,
                            text: studio_buttons[mode],
                            href: "#",
                            "data-mode":mode,
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

        $('.modal-window .editor-modes .modal_tab').click(function(){
            tab_switch($(this).attr('data-mode'));
        });

        // Clicked Save button
        $('#chx_submit').click(function(eventObject) {
            studio_submit(true);
            setTimeout(function(){location.reload();},200);
        });

    });

}
