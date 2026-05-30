Kane CLI Hack Day
May
30
Saturday, May 30
9:30 AM - 8:00 PM
TestMu AI (Formerly LambdaTest)
San Francisco, CA
Starting in 1d 10h
You’re In

Add to Calendar



Invite a Friend
No longer able to attend? Notify the host by canceling your registration.
Profile Complete · Reminder: SMS & Email
About Event
​Build it with an agent. Verify it with Kane. Ship by dinner.

​A one-day, in-person hackathon for developers who build with AI coding agents — and want to see what happens when you put a real verification layer next to them.

​50 builders. One room in San Francisco. $5,000 in prizes. Hosted by TestMu AI, in partnership with dev.to and AWS.

​The Challenge
​Build a working web app in AWS Kiro. Use Kane CLI to verify it works. Ship by 6 PM.

​That's the whole brief. The app can be anything you want: a tool, a dashboard, a side project you've been meaning to start, a game, an internal utility, a weird experiment. The only constraints are:

​AWS Kiro is the IDE. Spec mode or vibe mode, your call. Use specs, hooks, steering — whatever fits the project. The build happens inside Kiro.

​Kane CLI verifies the app. At a minimum at demo time. The strongest submissions wire Kane into Kiro directly, a hook that fires Kane on save, an agent that reads Kane's NDJSON output and iterates, a spec that compiles down to Kane flows.

​It runs, it ships, and you can demo it live at the end of the day.

​You can work solo or in teams of up to four. Bring a laptop, your usual stack, and your AWS account. Everything else is on us.

​Before you arrive
​Three things, ideally done the night before:

​Install AWS Kiro and sign in. Download from kiro.dev. Sign in with your AWS account (or social login if you're trying it for the first time). Run one chat in vibe mode to make sure it's working.

​Install Kane CLI and run one flow. Run npm install -g @testmuai/kane-cli, then try one of the examples from the docs. If fifty people are doing fresh npm installs at 10:05 AM, the hackathon loses an hour. We'll send a cheat sheet with your confirmation email.

​Read the Kiro × Kane integration guide. We'll send a short doc showing how to wire a Kiro hook to a Kane run. It's the fastest path to a closed loop on the day.

​You'll have free Kane CLI Pro access for the day, so don't worry about hitting limits during the event.

​Prizes
​$5,000 USD in cash, split across three winners. Every winner also gets the full perks stack.

​1st Place — $2,500

​2nd Place — $1,500

​3rd Place — $1,000

​In addition to the cash, every winning team receives:

​A 1:1 with the TestMu AI founders

​Design partner status with input on the Kane CLI roadmap

​3 months of Kane CLI Pro

​A featured post on the TestMu blog

​A showcase feature on testmuai.com/kane-cli/showcase

​Amplification across TestMu and dev.to channels

​FAQs
​Do I have to use Kiro? Yes. Kiro is the required IDE for this event. The whole challenge is built around what Kiro's spec-driven workflow looks like when it's paired with a real verification layer — without Kiro in the loop, the closed-loop story doesn't land. If you've never used Kiro before, that's fine — it's a familiar IDE if you've used Cursor or Windsurf, and we'll have setup help on the day.

​Which other AI tools can I use alongside Kiro? Anything that helps you ship. Kane CLI is the required verification layer. Kiro is the required IDE. Beyond that — Claude, GPT, your own custom agent, an MCP server, whatever you want. Kiro itself runs on Claude under the hood, so if you're already familiar with Claude Code, you'll feel at home.

​Do I need a paid Kane CLI plan to enter? No. Everyone selected gets free Kane CLI Pro access for the duration of the event. Winners get an additional three months on top.

​Do I need a paid Kiro or AWS account? Kiro has a free tier that's more than enough for the day. Sign up at kiro.dev before you arrive.

​Can I bring a project I've already started? You can build on existing work, but the Kiro setup and the Kane CLI integration must happen during the day. State at demo time what existed at 10 AM and what got added during the event. Judges will weight the new work.

​Can I work solo? Yes. Solo entries are welcome. So are teams of up to four.

​Do I need to know Playwright or Selenium? No. Kane CLI is plain English — you describe the flow, Kane runs it. If you do know Playwright, the Playwright export feature is built in and useful for the writeup, but it isn't required.

​Should I use Kiro spec mode or vibe mode? Either. Spec mode pairs especially well with Kane — your spec describes intended behavior, Kane verifies the behavior matches. Vibe mode is faster for exploratory builds. Many strong submissions will use both: vibe to prototype, spec to lock in the contract once it works.

​What if my project breaks during demos? Test thoroughly before 5 PM. Submissions lock at the deadline — you can't push fixes during demos. If your project depends on a third-party service, include a fallback (a recorded run, a backup deploy) so the judges can still see what you built.

​Where do I ask questions during the event? TestMu engineers and dev.to staff will be on the floor all day. There's also a #kane-hackday-sf Discord channel for fast questions.

​Can I submit more than one project? One submission per team. If you want to build two things, build them with two teams.

​Can I use Kane CLI alongside Playwright or Selenium? Yes. Kane sits next to existing test setups. Many strong submissions will use Kane for flows that never made it into a Playwright suite — the quick checks, the one-offs, the things that didn't justify framework setup. Playwright export is built in if you want to lock a flow in as code.

​Do I need to publish on dev.to? A dev.to writeup isn't required for prize eligibility, but it's strongly encouraged. Every team gets credited in the joint TestMu + dev.to event recap, and standout posts get amplified.

Location
TestMu AI (Formerly LambdaTest)
REDACTED Suite 500, San Francisco, CA 94104, USA