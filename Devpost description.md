Kane CLI Hack Day
Build it with an Agent. Verify it with Kane. Ship by Dinner.
Find teammates
Who can participate
Above legal age of majority in country of residence
Professionals/Post grads only
Team required
US only
View full rules
Submissions open soon
View schedule

May 30, 2026
TestMu AI (formerly LambdaTest) Office
Public
$5,000 in cash	24 participants
TestMu AI
Machine Learning/AI
About the Challenge
A one-day, in-person hackathon for developers who build with AI coding agents — and want to see what happens when you put a real verification layer next to them.


50 builders. One room in San Francisco. $5,000 in prizes. Hosted by TestMu AI, in partnership with dev.to.

Why we're running this
AI coding agents have changed how software gets written. Features ship from prompts. Bugs get fixed in seconds. But one part of the loop never closed: when the agent ships something, someone still has to open a browser and click through to see if it actually works.

Kane CLI was built for that gap. It's a plain-English browser automation tool that runs from your terminal. One command, no selectors, no framework. It opens a real local browser, runs the flow you describe, and returns a pass or fail with a video trace. It works as a developer utility. It also works as a tool that any AI coding agent can call directly.

Kiro is the natural partner for it. AWS's agentic IDE was built around spec-driven development, you describe what the app should do, Kiro generates the tasks and the code with full traceability back to the spec. The thing that's been missing is a way to verify the generated code actually behaves the way the spec said it should. Kane CLI is that piece. Specs describe intended behavior. Kane proves whether the behavior matches.

We want to see what builders do when you put those two together.


This hack day is an invitation: bring a problem worth solving, build it in Kiro, verify it with Kane CLI, and ship something real in a single day. The room is curated, we're keeping it to fifty serious builders so the conversation in person is as good as the code on screen.

Code of Conduct: https://www.testmuai.com/legal/terms-of-service/

Requirements
The Challenge Build a working web app in AWS Kiro. Use Kane CLI to verify it works. Ship by 6 PM.
That's the whole brief. The app can be anything you want: a tool, a dashboard, a side project you've been meaning to start, a game, an internal utility, a weird experiment. The only constraints are:

AWS Kiro is the IDE. Spec mode or vibe mode, your call. Use specs, hooks, steering — whatever fits the project. The build happens inside Kiro.

Kane CLI verifies the app. At a minimum at demo time. The strongest submissions wire Kane into Kiro directly, a hook that fires Kane on save, an agent that reads Kane's NDJSON output and iterates, a spec that compiles down to Kane flows.

It runs, it ships, and you can demo it live at the end of the day.

You can work solo or in teams of up to four. Bring a laptop, your usual stack, and your AWS account. Everything else is on us.

What "ready to ship" means
When you walk up to demo, your project needs to clear three bars. Miss any of them and the judges won't be able to score the rest of what you built.

The app works end-to-end. A user can load it, complete the primary flow, and get a result. Not a screenshot, not a mock — the real thing, deployed or runnable locally with one command.

Kane CLI caught something or proved something. You can show one of two things on stage: "Kane caught this bug during the build, here's the failed run," or "Kane verifies these flows pass, here's the green run." Either counts. What doesn't count: Kane installed but never run, or one trivial flow tacked on at the end to qualify.

Kiro and Kane talked to each other. Kiro's output triggered a KaneCLI run, or a Kane result triggered Kiro to do something. The cleanest version: a Kiro hook fires Kane on save, Kane fails, Kiro reads the failure, Kiro edits the code, the next save fires Kane again. Show us that moment. The tighter the loop, the higher the score.

How we'll judge it
Each team gets a 3-minute demo and 2 minutes of questions in front of a panel of TestMu AI engineers. Scoring is on four dimensions, weighted equally:

Dimension

What we're looking for

Ships

A working app with a real flow that runs end-to-end. Not slides.

Verified

Kane CLI actually exercised the app and caught or confirmed something meaningful.

Closed loop

Kiro built → Kane verified → result fed back into Kiro. The tighter the integration, the higher the score.

Craft

Did you reach for something interesting? Does this feel like a thing a developer would want to install tonight?


A polished todo app with one KaneCLI flow tacked on at the end will lose to a weirder, scrappier thing where a Kiro hook fires KaneCLI and Kiro re-prompts itself based on what Kane finds. Both are valid submissions. The second is the one we're really hoping to see.

Prizes
$5,000 in prizes
1st Prize
$2,500 in cash
1 winner
2nd Prize
$1,500 in cash
1 winner
3rd Prize
$1,000 in cash
1 winner
Devpost Achievements
Submitting to this hackathon could earn you:


X Hackathons
 level 2

Hackathon Winner
 level 2
Judges
Kavya
Kavya
TestMu AI

Judging Criteria
Closed loop
Kiro built → Kane verified → result fed back into Kiro. The tighter the integration, the higher the score.