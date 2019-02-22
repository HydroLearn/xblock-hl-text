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
from .utils import render_template, load_resource, resource_string
from django.template import Context, Template

# imports for content indexing support
import re
from xmodule.util.misc import escape_html_characters

# import for adding 'editor tabs' the right way potentially
# from xmodule.editing_module import TabsEditingDescriptor

from xblock.core import XBlock
from xblock.fields import Scope, Integer, List, String, Boolean, Dict
#from xblock.fragment import Fragment
from web_fragments.fragment import Fragment

class HLCustomTextXBlock(XBlock):
    """
    TO-DO: document what your XBlock does.
    """

    display_name = String(
        display_name="Component Display Name",
        help="This name appears in the horizontal navigation at the top of the page",
        scope=Scope.settings,
        default="HydroLearn Text Block"
    )

    content = String(
        help="Content of the text block.",
        default="<p>There doesn't appear to be any content...</p>",
        scope=Scope.content,
    )

    @XBlock.json_handler
    def get_body_html(self, data, suffix=''):
        return {"content": self.content}

    @staticmethod
    def generate_html(html):
        # add a wrapper around the content so ck-styling applies
        result = "<div class='HL_Text ck-content'>"
        # Assume valid HTML code
        result += html
        result += "</div>"

        return result

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
        The student view
        """
        fragment = Fragment()

        # i assume this is making the xblock instance available from the front end
        # since 'content' is being passed as context for the template.

        content = {'self': self}

        body_html = unicode(self.generate_html(self.content))
        fragment.add_css(load_resource('static/css/lms-styling.css'))
        fragment.add_css(load_resource('static/css/ck-content-styling.css'))
        fragment.add_content(Template(body_html).render(Context(content)))
        #fragment.add_content(render_template('templates/HLCustomText.html', content))



        # add the custom initialization code for the LMS view and initialize it
        fragment.add_javascript(unicode(render_template('static/js/HLCustomText_lms.js', content)))
        fragment.initialize_js('HLCK5_XBlock')

        return fragment

    def studio_view(self, context=None):
        """
        The studio view
        """
        content = {'self': self}

        fragment = Fragment()
        # Load fragment template
        fragment.add_content(render_template('templates/HLCustomText_edit.html', content))

        # add static files for styling, custom CK5 build, and template initialization
        fragment.add_css(load_resource('static/css/cms-styling.css'))
        fragment.add_css(load_resource('static/css/modal-styling.css'))
        fragment.add_css(load_resource('static/css/ck-content-styling.css'))
        fragment.add_javascript(unicode(render_template('static/js/HL_ck5_custom.js', content)))
        fragment.add_javascript(unicode(render_template('static/js/HLCustomText_edit.js', content)))
        fragment.initialize_js('HLCK5_XBlockStudio')

        return fragment

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
        xblock_body = super(HLCustomTextXBlock, self).index_dictionary()
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
        html_content = escape_html_characters(html_content)
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
            ("HLCustomTextXBlock",
             """<HLCustomText/>
             """),
        ]
