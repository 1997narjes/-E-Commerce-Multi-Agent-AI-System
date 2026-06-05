import os

base = r"C:\Users\Asus\desktop\agentsIA\Multi_Agents\venv311\Lib\site-packages\litellm"

count = 0
for root, dirs, files in os.walk(base):
    for fname in files:
        if fname.endswith(".py"):
            fpath = os.path.join(root, fname)
            try:
                with open(fpath, "r", encoding="utf-8", errors="ignore") as f:
                    lines = f.readlines()
                new_lines = []
                changed = False
                for line in lines:
                    if "cache_breakpoint" in line:
                        print(f"Supprimé dans {fpath}: {line.rstrip()}")
                        changed = True
                        continue
                    new_lines.append(line)
                if changed:
                    with open(fpath, "w", encoding="utf-8") as f:
                        f.writelines(new_lines)
                    count += 1
            except:
                pass

print(f"✅ {count} fichier(s) patché(s) !")