/* JavaScript for HydroLearn's text editor XBlock, Studio Side. */
function HL_TEXT_STUDIO(runtime, xblock_element) {

    // add modal tag so it's width gets adjusted on window resize
    $(xblock_element).closest('.modal-window').addClass('hl_resize_correction');

    var editor_element_id = "HL_Text_editorBody";

    // Define mapping of tabs (modes) to display names
    var studio_buttons = {
        "editor": "EDITOR",
        "settings": "SETTINGS",
    };

    var ckeditor_html = "";

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

    function tab_highlight(toHighlight) {
        $('.modal-window .editor-modes .modal_tab').removeClass('is-set');
        $('.modal-window .editor-modes .modal_tab[data-mode="' + toHighlight + '"]').addClass('is-set');
    }

    // Hide all panes except toShow
    function tab_switch(toShow) {

        tab_highlight(toShow);

        $('.modal-window .modal_tab_view').hide()
        $('.modal-window .modal_tab_view[data-mode="' + toShow + '"]').show();

        $('body').trigger('resize_modal')
    }

    // Send current code and settings to the backend
    function studio_submit(commit) {

        commit = commit === undefined ? false : commit;
        var handlerUrl = runtime.handlerUrl(xblock_element, 'studio_submit');

        // get the form data from the edit modal
        var data = {
            "commit": commit.toString(),
            "display_name": $('.chx_display_name').val(),
            "body_html": ckeditor_html.getData(),
        }

        runtime.notify('save', {state: 'start'});
        $.post(handlerUrl, JSON.stringify(data)).done(function(response) {
          runtime.notify('save', {state: 'end'});
        });
    }

    $(function($) {

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


        $('.modal-window .editor-modes .modal_tab').click(function(){
            tab_switch($(this).attr('data-mode'));
        });

        // save button clicked
        $(xblock_element).find('.save-button').bind('click', function() {
            studio_submit(true);
        });

        // cancel button clicked
        $(xblock_element).find('.cancel-button').bind('click', function() {
            runtime.notify('cancel', {});
        });

    });


}
