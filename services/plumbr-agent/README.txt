System requirements
-------------------------------

Processor architectures: x86_64
Operating systems: Linux 2.6.28 (glibc 2.10+) and later
Supported platforms: Apache 2 with mod_php, PHP-FPM (5.x and later)

Installation
-------------------------------

Run the installer in your terminal:

$ sudo ./PlumbrAgentInstaller

You will be asked for a server name and cluster names for your applications.

Default options will be provided, to proceed press enter.

Server name identifies the machine the agent is running on and will be visible under API call details.

Cluster name will be used for API naming in Plumbr dashboard.
Several machines can be grouped with the same cluster name.

Server URL will only need to be changed for on-premise installations.

The installer will set up plumbr-agent daemon and add a reference to Plumbr agent library into
your application configuration files. The library will be loaded into your application processes on startup.

After a successful install you will be asked to restart your services (PHP-FPM and/or Apache 2).

Head to https://app.plumbr.io to see your applications, it might take a minute for the first data to show up.

NOTE: It is possible to run the installer without input prompts. See 'Unattended install' section.

Usage
-------------------------------

Starting, stopping and restarting Plumbr agent daemon:

On systemd:

$ sudo service plumbr-agent start/stop/restart

On SysV init:

$ sudo service plumbr-agent-1.1 start/stop/restart

Stopping the Plumbr agent daemon will stop all data collection,
however agents will still be attached to your applications.

Configuration
-------------------------------

The agent configuration file can be found at /opt/plumbr-agent/conf/agent.properties.

Configuration fields beginning with 'daemon' are global for the machine you are running on.

Valid daemon configuration fields are:
daemon.serverId  - Machine identifier
daemon.serverUrl - The endpoint agent will send its data to
daemon.apiKey    - API key used for authentication. You can find your agent API key under Account Settings.

An example of a valid configuration line:
daemon.serverUrl=https://app.plumbr.io

After changing configuration options, you will need to restart the Plumbr agent service.

Uninstall
-------------------------------

$ sudo /opt/plumbr-agent/uninstall.sh

The uninstall script will completely remove the agent and its configuration from your machine.

Restart your services to detach existing agents from your applications.

Unattended install
-------------------------------

To skip the installer from asking for user input (e.g. in automated scripts) you can start it in unattended mode:

$ sudo ./bin/PlumbrAgentInstaller --unattended --server-id=my-server-id --cluster-id=my-cluster-id

Additionally, if running an on-premise setup, you can provide a custom server URL:

$ sudo ./bin/PlumbrAgentInstaller --unattended --server-id=my-server-id --cluster-id=my-cluster-id --server-url=http://plumbr.local

The installer will look for the agent API key from agent.properties next to the installer or from an existing install
configuration. To override the API key, pass --api-key=my-api-key to the installer.

