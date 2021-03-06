"""

XBlock for presenting the user with a CKEditor 5 instance for entering textual content.

This block is meant as a replacement for the default OpenEDX text block, as at the time of development,
the OpenEDX platform is still utilizing TinyMCE


Author : Cary Rivet

Disclaimer:
    the code below was derived from a working example of the 'LynxTable' xblock
    located here: https://github.com/mjrulesamrat/lynxtable

    this block was developed as an example for the initial development of this xblock to get started. ( I is n00b )
    over time this block's implementation will be converted to a better standard for use in the HydroLearn platform.

"""

import urllib, datetime, json, urllib2

# imports for content indexing support
import re
# from xmodule.util.misc import escape_html_characters

# import for adding 'editor tabs' the right way potentially
# from xmodule.editing_module import TabsEditingDescriptor

from xblock.core import XBlock
from xblock.fields import Scope, Integer, List, String, Boolean, Dict
#from xblock.fragment import Fragment
from web_fragments.fragment import Fragment


from xblockutils.resources import ResourceLoader
loader = ResourceLoader(__name__)

# from hl_xblock_utils import HLXBlockModalHelperMixin


# class hl_text_XBlock(HLXBlockModalHelperMixin, XBlock):
class hl_text_XBlock(XBlock):
    """
        generate an instance of custom CK5 editor providing rich textual content
        input in xblocks.

        A starter template can be provided by overriding the 'get_empty_template' method.
    """
    CATEGORY = "hl_text"
    STUDIO_LABEL = "Text"

    display_name = String(
        display_name="Display Name",
        help="This name appears in the horizontal navigation at the top of the page",
        scope=Scope.settings,
        default="Text"
    )

    content = String(
        help="Content of the text block.",
        default="",
        scope=Scope.content,
    )

    # def modal_tabs(self):
    #     return [
    #         {
    #             'display_name': 'editor',
    #             'template': 'test1'
    #         },
    #         {
    #             'display_name': 'settings',
    #             'template': 'test2'
    #         },
    #     ]

    def get_empty_template(self, context=None):
        context = context or {}
        return loader.render_django_template('templates/empty_template.html', context)

    def get_help_template(self, context=None):
        context = context or {}
        return None


    @XBlock.json_handler
    def get_body_html(self, data, suffix=''):
        return {"content": self.content}

    @staticmethod
    def update_student_settings_backend(source, settings):
        """
        Returns dictionary that is source merged with settings
        """
        result = json.loads(source)
        result.update(json.loads(settings))
        return json.dumps(result)

    def student_view(self, context=None):
        """
            The student view of the xblock

            return: a web fragment containing the necessary styles/scripts/templates
                for rendering the xblock in the lms portion of the site and cms preview
        """

        # i assume this is making the xblock instance available from the front end
        # since 'content' is being passed as context for the template.
        context['self'] = self
        context['empty_template'] = self.get_empty_template(context)

        fragment = Fragment()
        # Load fragment template
        fragment.add_content(loader.render_django_template('templates/hl_text-lms.html', context))


        fragment.add_css(loader.load_unicode('static/css/lms-styling.css'))
        fragment.add_css(loader.load_unicode('static/css/ck-content-styling.css'))
        
        # CJR 7/8/20
        #   Add highlightJS styling and library for use by code blocks in text 
        fragment.add_css(loader.load_unicode('static/highlightJS/styles/default.css'))
        fragment.add_javascript(loader.load_unicode('static/highlightJS/highlight.pack.js'))
        
        # add the custom initialization code for the LMS view and initialize it        
        fragment.add_javascript(loader.load_unicode('static/js/hl_text-lms.js'))
        
        fragment.initialize_js('HLCK5_XBlock')

        return fragment


    def studio_view(self, context=None):
        """
            The studio view of the xblock

            return: a web fragment containing the necessary styles/scripts/templates
                for rendering the xblock editor in the cms xblock modal window.


        """
        context = None or {}

        context['self'] = self
        context['empty_template'] = self.get_empty_template(context)
        context['help_template'] = self.get_help_template(context)


        # load the fragment generated by the util's studio view for supporting tabs
        # fragment = super(hl_text_XBlock, self).studio_view(context)
        fragment = Fragment()

        # Load fragment template
        fragment.add_content(loader.render_django_template('templates/hl_text-cms.html', context))

        # add static files for styling, custom CK5 build, and template initialization
        fragment.add_css(loader.load_unicode('static/css/cms-styling.css'))
        fragment.add_css(loader.load_unicode('static/css/modal-styling.css'))
        fragment.add_css(loader.load_unicode('static/css/ck-content-styling.css'))
        fragment.add_javascript(loader.load_unicode('static/js/HL_ck5_custom.js'))
        fragment.add_javascript(loader.load_unicode('static/js/hl_text-cms.js'))
        fragment.initialize_js('HL_TEXT_STUDIO')




        return fragment

    def public_view(self, context=None):
        return self.student_view(context)

    @staticmethod
    def generate_preview(self, dependencies, html, json, jsa, jsb, css):

        preview = ""

        return preview

    @XBlock.json_handler
    def studio_submit(self, data, suffix=''):
        """
        Course author pressed the Save button in Studio
        """

        result = {"submitted": "false", "saved": "false", "message": "", "preview": ""}

        if len(data) > 0:
            # NOTE: No validation going on here; be careful with your code
            self.display_name = data["display_name"]
            self.dependencies = ""
            self.content = data["body_html"]

            result["submitted"] = "true"
            result["saved"] = "true"

        return result

    def index_dictionary(self):
        xblock_body = super(hl_text_XBlock, self).index_dictionary()
        # Removing script and style
        html_content = re.sub(
            re.compile(
                r"""
                    <script>.*?</script> |
                    <style>.*?</style>
                """,
                re.DOTALL |
                re.VERBOSE),
            "",
            self.content
        )
        # html_content = escape_html_characters(html_content)
        html_body = {
            "html_content": html_content,
            "display_name": self.display_name,
        }
        if "content" in xblock_body:
            xblock_body["content"].update(html_body)
        else:
            xblock_body["content"] = html_body
        xblock_body["content_type"] = "Text"
        return xblock_body

    # TO-DO: change this to create the scenarios you'd like to see in the
    # workbench while developing your XBlock.
    @staticmethod
    def workbench_scenarios():
        """A canned scenario for display in the workbench."""
        return [
            ("HL Text XBlock",
             """<hl_text/>
             """),
        ]
