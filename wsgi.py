# ==============================================================================
# WSGI Entry Point untuk PythonAnywhere
# File ini digunakan oleh PythonAnywhere sebagai WSGI config.
# Isi WSGI configuration file di PythonAnywhere dengan konten ini,
# atau arahkan path ke file ini.
# ==============================================================================

import sys
import os

# Ganti 'tristahana' dengan username PythonAnywhere kamu
PROJECT_HOME = '/home/tristahana/PORTOFOLIO'

if PROJECT_HOME not in sys.path:
    sys.path.insert(0, PROJECT_HOME)

os.chdir(PROJECT_HOME)

from app import app as application  # noqa

