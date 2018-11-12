import os
[os.rename(f, f.replace('.js.js', '.js'))
 for f in os.listdir('.') if f.endswith('.js')]
