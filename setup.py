"""Setup for hl_text XBlock."""

import os
from setuptools import setup


def package_data(pkg, roots):
    """Generic function to find package_data.

    All of the files under each of the `roots` will be declared as package
    data for package `pkg`.

    """
    data = []
    for root in roots:
        for dirname, _, files in os.walk(os.path.join(pkg, root)):
            for fname in files:
                data.append(os.path.relpath(os.path.join(dirname, fname), pkg))

    return {pkg: data}


# Constants #########################################################
VERSION = '1.0.0'

# xblocks  #########################################################
PREREQs = [
    'XBlock',
    'hl-xblock-utils',
]

BLOCKS = [
    'hl_text = hl_text:hl_text_XBlock',
]



setup(
    name='hl-text-xblock',
    version=VERSION,
    author="cRivet",
    description='Custom Text editor xblock package for loading instance of customized CKEditor5 for use adding textual course content.',
    packages=[
        'hl_text',
    ],
    install_requires=PREREQs,
    entry_points={
        'xblock.v1': BLOCKS,
    },
    package_data=package_data("hl_text", ["static", "public", "templates"]),
)
