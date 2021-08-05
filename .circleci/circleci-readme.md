CI Debug Notes
================
To validate some circleci stuff, I was able to run a “build locally” using the steps below.
The local build runs in a docker container.

* (Once) Install circleci client (`brew install circleci`)

* Convert the “real” config.yml into a self contained (non-workspace) config via:

      circleci config process .circleci/config.yml > .circleci/local-config.yml

* Run a local build with the following command:

      circleci local execute -c .circleci/local-config.yml --job 'build'

  Typically, both commands are run together:

      circleci config process .circleci/config.yml > .circleci/local-config.yml && circleci local execute -c .circleci/local-config.yml --job 'build'

  With the above command, operations that cannot occur during a local build will show an error like this:

    ```
    ... Error: FAILED with error not supported
    ```

  However, the build will proceed and can complete “successfully”, which allows you to verify scripts in your config, etc.

  If the build does complete successfully, you should see a happy yellow `Success!` message.

# Plugin Publishing notes

Thanks to Ops, we have a shiny new group publisher (`community-group-chrome-store`)to use when publishing this plugin. 
New developers who want to work on the publishing side, need to be added to the google group `community-group-chrome-store`
(of the same name). See 
[Group Publishers and such](https://developer.chrome.com/docs/webstore/group-publishers/#publishing-using-a-group-publisher).
