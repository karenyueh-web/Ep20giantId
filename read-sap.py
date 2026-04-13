import os, sys

folder = r'C:\Users\G00106917\Desktop\Ep2-giantId'
files = os.listdir(folder)
sap_file = next((f for f in files if 'SAP' in f), None)
print('Found:', sap_file)

if sap_file:
    path = os.path.join(folder, sap_file)
    for enc in ['utf-8-sig', 'big5', 'cp950', 'utf-8']:
        try:
            with open(path, encoding=enc) as f:
                content = f.read(5000)
            print(f'Encoding: {enc}')
            print(content)
            break
        except Exception as e:
            print(f'{enc} failed: {e}')
