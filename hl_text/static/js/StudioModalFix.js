function StudioModalFix_script(runtime, xblock_element) {
    // add modal tag so it's width gets adjusted on window resize
    $(xblock_element).closest('.modal-window').addClass('hl_resize_correction');

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


    $(function($) {
        // TODO: dont currently have a method to pass this information to the view,
        //          technically this could be passed via the initial config
        //          (third param to parent function)
        //
        //          but technically this is a hack anyway... as xblocks
        //          do have ways to add tab views...

        // add actions for the top of the modal to switch views
        // for (var mode in studio_buttons) {
        //     $('.editor-modes')
        //         .append(
        //             $('<li>', {class: "action-item"}).append(
        //                 $('<a />', {
        //                     //class: "action-primary",
        //                     class: mode + "-button modal_tab",
        //                     //id: mode,
        //                     text: studio_buttons[mode],
        //                     href: "#",
        //                     "data-mode":mode,
        //                 })
        //             )
        //         );
        // }

        $('.modal-window .editor-modes .modal_tab').click(function(){
            tab_switch($(this).attr('data-mode'));
        });

    })
}
