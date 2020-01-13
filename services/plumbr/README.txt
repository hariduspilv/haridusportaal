Plumbr - Java Performance Monitoring
======================================
Plumbr monitors your Java application, detects if it has any performance issues and reports 
its findings to you. The report contains precise instructions on where the issue occurs 
and how severe is the incident. In most cases Plumbr also instructs how to fix the situation.

1. Installation
--------------------------------
In most cases installing Plumbr is as easy as the following:

1. Add the below parameter to your server/application startup command:

-javaagent:/FOLDER_WHERE_YOU_UNZIPPED_PLUMBR/plumbr.jar

2. Start your application and use it as usual. The first thing you will see in 
   your standard out at server start should be the following banner:
   
     **************************************************
     *                                                *
     * Plumbr (version number) is started.           *
     *                                                *
     **************************************************

3. When you have attached the agent, return to https://app.plumbr.io to verify the
presence of a new session.

If you face problems with installation, please see the full installation guide 
at https://plumbr.io/support/on-demand-plumbr

4. Usage
--------------------------------
To detect performance problems, Plumbr needs to analyze the application behaviour
during runtime. To do so the application has to be used. This is easiest to achieve 
in production environment where your end users will do the trick. 

When you cannot use Plumbr in production environment you have to simulate the usage.
There are numerous ways to simulate the end user behavior -- for example to
generate load on a web application we can recommend Apache JMeter. 

Whatever the tool of your choice - bear in mind that Plumbr needs information from 
different parts of your application to distinguish between normal and faulty behavior.

The time it takes Plumbr to discover performance issues  can vary from minutes to days. 
To make sure you will not miss a performance issue, Plumbr will alert you via email when
a performance issue has been detected.

Need help?
-------------------------------
Check out the documentation at https://plumbr.io/support or write to us: support@plumbr.io