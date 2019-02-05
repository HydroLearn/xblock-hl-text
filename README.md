# xblock-hl_text
pip package for custom xblock to present users with custom build of CKEditor 5.



## Building the Package

### Requirements
- python installed
- pip installed
- pip wheel installed

#### Additional helpful packages
- if modifying styles, you will need a sass compiler, if using windows I recommend Koala (http://koala-app.com/).
  - unfortunately I do not have a recommendation for Linux based sass compilers, but if I recall correctly there are several python packages which can accomplish the task.

### Build Process
- Download the project
- navigate to the project's root directory in a terminal session
- run `python setup.py bdist_wheel`
 - this will generate the following in the root directory
   - a `build` directory (excluded from repository by default)
   - a `dist` directory (excluded from repository by default)
   - additionally this will update the contents of the `xblock_hl_text.egg-info` directory to update the list of sources for the package
