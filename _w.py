import os
base = "/Users/shannonkempenich/CascadeProjects/founder-spend-and-subscription-tracker"

def w(path, content):
    full = os.path.join(base, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w") as f:
        f.write(content)
    print("Written:", path)
