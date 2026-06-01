/* JavaScript for HydroLearn's text editor XBlock, Studio Side. */
function HL_TEXT_STUDIO(runtime, xblock_element) {
  // add modal tag so it's width gets adjusted on window resize
  $(xblock_element).closest(".modal-window").addClass("hl_resize_correction")

  var editor_element_id = "HL_Text_editorBody"

  // Define mapping of tabs (modes) to display names
  var studio_buttons = {
    editor: "EDITOR",
    settings: "SETTINGS",
  }

  var ckeditor_html = ""

  // added 6/1/26

  function copy_block_content() {
    // const element = xblock_element.querySelector(".ck-content")
    const element = $(xblock_element).find(".ck-content").get(0)
    // Create blobs for both rich HTML and plain text fallback
    const htmlBlob = new Blob([element.innerHTML], { type: "text/html" })
    const textBlob = new Blob([element.innerText], { type: "text/plain" })

    // Pack them into a ClipboardItem object
    const clipboardItem = new ClipboardItem({
      "text/html": htmlBlob,
      "text/plain": textBlob,
    })

    // Write the rich data to the system clipboard
    navigator.clipboard
      .write([clipboardItem])
      .then(() =>
        alert(
          "Block content copied! You can now paste the content in the new location with (Ctrl+V)",
        ),
      )
      .catch((err) => console.error("Failed to copy block content: ", err))
  }

  // Bind a copy-to-clipboard event to newly added button
  let BUTTON_copy_to_clipboard = $(xblock_element)
    .find("button.copy-block-content")
    .get(0)
  BUTTON_copy_to_clipboard?.addEventListener("click", copy_block_content)

  // if (typeof HL_CKEDITOR != "undefined") {
  if (false) {
    console.log("HL_CKEDITOR was loaded.")

    //HL_CKEDITOR.default.classic_editor
    HL_CKEDITOR.default.document_editor
      .create(document.getElementById(editor_element_id), {
        /* 
        // REMOVED 5/1/2026  - NO LONGER FUNCTIONAL AS OF ULMO
        //      They've removed window.course.id
        upload_config: {
                    // update 6/10/20
                    // The URL that the images are uploaded to.
                    uploadUrl: "/assets/" + window.course.id + "/",
                    //payloadName: 'file',
                    requestPayloadName: 'file',
                    responsePayloadName: 'asset',
                    
                    // Headers sent along with the XMLHttpRequest to the upload server.
                    headers: {
                        'X-CSRFToken': getCookie('csrftoken'),
                        "Accept": "application/json",                        
                    }
                } */
      })
      .then((editor) => {
        ckeditor_html = editor

        const toolbarContainer = document.querySelector(
          ".document-editor__toolbar",
        )
        toolbarContainer.appendChild(editor.ui.view.toolbar.element)

        console.log("HL_CKEDITOR successfully initialized.")
      })
      .catch((err) => {
        console.log("HL_CKEDITOR initialization Failed!")
        console.log(err.stack)
      })
  }

  function getCookie(name) {
    var cookieValue = null
    if (document.cookie && document.cookie !== "") {
      var cookies = document.cookie.split(";")
      for (var i = 0; i < cookies.length; i++) {
        var cookie = jQuery.trim(cookies[i])
        // Does this cookie string begin with the name we want?
        if (cookie.substring(0, name.length + 1) === name + "=") {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1))
          break
        }
      }
    }
    return cookieValue
  }

  function tab_highlight(toHighlight) {
    $(".modal-window .editor-modes .modal_tab").removeClass("is-set")
    $(
      '.modal-window .editor-modes .modal_tab[data-mode="' + toHighlight + '"]',
    ).addClass("is-set")
  }

  // Hide all panes except toShow
  function tab_switch(toShow) {
    tab_highlight(toShow)

    $(".modal-window .modal_tab_view").hide()
    $('.modal-window .modal_tab_view[data-mode="' + toShow + '"]').show()

    $("body").trigger("resize_modal")
  }

  // Send current code and settings to the backend
  function studio_submit(commit) {
    commit = commit === undefined ? false : commit
    var handlerUrl = runtime.handlerUrl(xblock_element, "studio_submit")

    // get the form data from the edit modal
    var data = {
      commit: commit.toString(),
      display_name: $(".chx_display_name").val(),
      body_html: ckeditor_html.getData(),
    }

    runtime.notify("save", { state: "start" })
    $.post(handlerUrl, JSON.stringify(data)).done(function (response) {
      runtime.notify("save", { state: "end" })
    })
  }

  $(function ($) {
    // add actions for the top of the modal to switch views
    for (var mode in studio_buttons) {
      $(".editor-modes").append(
        $("<li>", { class: "action-item" }).append(
          $("<a />", {
            //class: "action-primary",
            class: mode + "-button modal_tab",
            //id: mode,
            text: studio_buttons[mode],
            href: "#",
            "data-mode": mode,
          }),
        ),
      )
    }

    // Set main pane to Options
    tab_switch("editor")

    // bind event to toggle help content and editor on click
    $(".template-help-icon").click(function () {
      $("#help-text-wrapper", xblock_element).toggle()
      $(".document-editor", xblock_element).toggle()
    })

    $(".modal-window .editor-modes .modal_tab").click(function () {
      tab_switch($(this).attr("data-mode"))
    })

    // save button clicked
    $(xblock_element)
      .find(".save-button")
      .bind("click", function () {
        // studio_submit(true)
        alert(
          "This Content Block is being depreciated, please migrate its content to the default 'Text' block",
        )
      })

    // cancel button clicked
    $(xblock_element)
      .find(".cancel-button")
      .bind("click", function () {
        runtime.notify("cancel", {})
      })
  })
}
