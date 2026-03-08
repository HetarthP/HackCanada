# Spotlight

**Stop interrupting content with ads. Be part of it.**

Spotlight lets companies integrate **AI that detects product placement opportunities and seamlessly inserts brands into video scenes.**

---

# Inspiration

Ads today interrupt content instead of becoming part of it. Pre-rolls, banners, and mid-roll ads disrupt the viewer experience, while traditional product placement, a **$20B+ industry**, is still negotiated manually between brands and large studios. Canada's creative economy is included. As production costs rise and traditional ad revenue vanishes, Canadian filmmakers are being priced out of their own market.

With Spotlight, we're providing a way for creators to monetize content without “selling out” to intrusive 30-second interruptions that drive audiences away.

At the same time, independent creators are producing more video content than ever, but most lack access to sponsorship opportunities unless they have large audiences or direct brand deals.

We realized that every video scene already contains natural opportunities for brands to appear — like a coffee cup on a table, a laptop on a desk, or a billboard in the background. The challenge is identifying those opportunities at scale.

Spotlight was created to turn video scenes into advertising opportunities automatically, helping creators monetize their content while allowing brands to appear naturally inside stories people already love.

---

# What It Does

Spotlight is an AI-powered platform that detects natural product placement opportunities inside video scenes and connects them with brands through a dynamic marketplace.

Creators upload video clips or select from our catalog, where our system analyzes each frame to detect contextual ad slots such as tables, shelves, billboards, or handheld items where products could naturally appear.

Brands upload their products and campaigns, and Spotlight matches them with appropriate scenes based on context, audience, and placement suitability.

Once a placement is selected, the product is seamlessly inserted into the scene using automated rendering techniques that match lighting, perspective, and scale.

This allows creators to monetize videos without interrupting storytelling, while brands gain exposure through advertising that feels natural to viewers.

---

# Backboard Integration

To make our system scalable, we integrated **Backboard** as the persistent memory layer for our placement engine.

After our pipeline scans a video using **FFmpeg** and analyzes frames with **Gemini**, the detected product placement opportunities are sent to Backboard where they are stored as structured campaign memory.

Each brand campaign is managed by a **stateful Backboard assistant** that acts as a campaign manager. This assistant remembers previous placements, enforces brand safety rules, and ensures variety across different videos so the same product is not repeatedly placed in identical contexts.

When our system detects placement opportunities, we create a persistent thread inside Backboard and log the Gemini analysis results.

These results include:

- placement coordinates  
- timestamps  
- detected objects  
- contextual metadata  

Using Backboard’s automatic memory system (`memory="auto"`), the assistant permanently stores these placement decisions so future videos can reference past campaigns.

This allows our platform to maintain **long-term campaign memory**, track which placements have already been used, and make smarter placement decisions over time.

Backboard effectively acts as the **system of record for all detected ad slots**, turning raw AI scene analysis into a structured, queryable placement database that powers our creator–brand marketplace.

---

# How We Built It

## The Dashboard

Built with **React, Next.js, TypeScript, and TailwindCSS**, the Spotlight dashboard allows creators to:

- upload videos  
- review detected ad slots  
- preview product placements  

through a clean SaaS-style interface.

---

## The Backend

Powered by **Python and FastAPI**, with **Celery and Redis** handling asynchronous video processing tasks so uploads return immediately while scene analysis runs in the background.

---

## The Video Engine

We use **FFmpeg** to extract frames and timestamps from videos, enabling:

- scene-level analysis  
- precise placement coordinates  

---

## The AI Layer

We integrated **Google Gemini** for multimodal scene understanding, detecting contextual:

- objects  
- surfaces  
- environments  

where natural product placements can occur.

---

## The Rendering Pipeline

Cloudinary handles:

- image warping  
- color matching  
- video layering  

to seamlessly insert brand products into scenes while preserving lighting and perspective.

We supercharge this pipeline using **Fal.ai** and **Kling AI’s Omni V2V model**, applying generative inpainting to permanently bake the assets into the video with perfect temporal consistency.

---

## The Placement Engine

Backboard.io powers our placement memory layer, storing and managing:

- timestamps  
- placement coordinates  
- contextual tags  
- brand links  

It allows us to persist scene analysis results from our AI pipeline and transform them into structured placement opportunities that can be dynamically matched between creators and advertisers.

Backboard also effectively acts as the system of record for all detected ad slots, enabling scalable retrieval, matching, and marketplace integration.

---

## Infrastructure

Video processing workloads run on **Vultr cloud GPUs**, allowing us to scale scene analysis and rendering efficiently.

---

## Database & Authentication

- **PostgreSQL + Prisma** store placement records and campaign data  
- **Auth0** secures the creator dashboard and manages authentication  

---

# Challenges We Ran Into

One of the biggest challenges was balancing scene understanding with performance.

Analyzing video frames for contextual ad opportunities requires significant computation, and we needed to keep the system responsive for a smooth user experience.

Another challenge was making product placements look realistic. Small differences in lighting, shadows, or perspective can make inserted objects look artificial, so we had to carefully design the rendering pipeline to ensure visual consistency.

---

# Accomplishments That We're Proud Of

We're proud that Spotlight transforms a traditionally manual process into an automated system.

We built a working platform that can:

- analyze video scenes  
- detect contextual product placement opportunities  
- connect them with brands through a marketplace  

We also designed a clean and intuitive dashboard where users can upload videos, review ad slots, and preview placements quickly.

Most importantly, we demonstrated how product placement can scale to support Canadian filmmakers and content creators, making it accessible to everyday creators.

---

# What We Learned

Through building Spotlight, we learned that the future of advertising is **integration rather than interruption**.

When brands appear naturally inside content, viewers are less likely to see them as ads and more likely to accept them as part of the environment without frustration.

We also learned how many unnoticed opportunities exist inside ordinary video scenes.

A simple table, shelf, or background object can become a brand opportunity when analyzed through the right lens.

---

# What's Next for Spotlight

Next, we want to expand Spotlight into a full marketplace connecting Canadian creators, brands, and media platforms.

Future improvements include:

- dynamic placements based on viewer demographics  
- integrations with **YouTube and TikTok**  
- advanced analytics to measure brand engagement and performance  

Our long-term vision is to make **product placement as scalable and accessible as digital advertising**, turning every video scene into a potential brand opportunity.

---

# Built With

- Auth0  
- Backboard.io  
- Celery  
- Cloudinary  
- CSS3  
- FastAPI  
- FFmpeg  
- Gemini  
- JavaScript  
- Next.js  
- PostgreSQL  
- Prisma  
- Python  
- React  
- Redis  
- Tailwind  
- TypeScript  
- Vultr  

---

# Team

- Hetarth Parikh  
- Shrey Shingala  
- Harsh Patel  
- Ryan Qi  

---

# Repository

GitHub Repo:  
https://github.com/HetarthP/Spotlight
