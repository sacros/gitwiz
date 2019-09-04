gitroot=$(git rev-parse --show-cdup)
echo $gitroot
gitroot=${gitroot:-.};
echo $gitroot
