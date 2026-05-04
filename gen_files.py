import os
base = "/Users/shannonkempenich/CascadeProjects/founder-spend-and-subscription-tracker"
def w(p, c):
    f = os.path.join(base, p)
    os.makedirs(os.path.dirname(f), exist_ok=True)
    open(f, "w").write(c)
    print("Written:", p)
