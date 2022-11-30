# This is a sample hook script created by Amplify CLI.
# To start using this post-push hook please change the filename:
# post-push.sh.sample  ->  post-push.sh
#
# learn more: https://docs.amplify.aws/cli/usage/command-hooks

if [ -z "$(which jq)" ]; then
    echo "Please install jq to run the sample script."
    exit 0
fi

parameters=`cat`
error=$(jq -r '.error // empty' <<< "$parameters")
data=$(jq -r '.data' <<< "$parameters")

# 
# Write code here:
#
if [ ! -z "$error" ]; then
    echo "Amplify CLI emitted an error:" $(jq -r '.message' <<< "$error")
    exit 0
fi
echo "project root path:" $(pwd);
echo "Amplify CLI command:" $(jq -r '.amplify | .command' <<< "$data")