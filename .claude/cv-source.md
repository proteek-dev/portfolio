**PROTEEK KUMAR SANYAL**

**AI Solutions Analyst  |  Business & Systems Analyst  |  Data Analyst**

0481 709 247  |  proteeksanyal1994@gmail.com

linkedin.com/in/proteeksanyal  |  github.com/proteek-dev  |  proteeksanyal.medium.com  |  Full working rights in Australia

**PROFILE**

I sit between business teams and technology, and most of my work starts with someone describing a problem rather than a solution. 6 years across business analysis, data and machine learning have taught me to ask what a team actually needs before deciding what to build. I currently do this at the City of Gold Coast, gathering reporting requirements from council departments, building the solutions myself in Power BI and Microsoft Fabric, then documenting the definitions and business rules so they survive after I move on.

My background in AI is hands-on rather than theoretical. I have taken a BERT sentiment model and an OCR document-parsing system into production, fine-tuned computer vision models that went into a live customer-facing application, and I use Claude and ChatGPT daily in my own work including building and deploying a machine learning service end to end on AWS. That experience is also why I am comfortable saying when generative AI is the wrong tool: I have seen where it adds real value and where it quietly adds risk.

**PROJECTS**

**Automated Scheme Research Tool**  *— retrieval-augmented document assistant*

- Government schemes go unused because the information sits in long PDFs nobody reads. I built a tool that ingests source URLs, summarises eligibility, benefits and application steps, and lets people ask questions of the material conversationally.
- LangChain for document loading and chaining, Hugging Face SentenceTransformers for embeddings, a FAISS index for similarity search, DistilBERT for extractive question answering, and a Streamlit chat interface with a persisted index so the same documents are not reprocessed.
- I designed it to run on free Hugging Face models with OpenAI as an optional upgrade, because a tool that only works with a paid API key is not much use to the organisations that need it most. The same pattern applies to internal policy and procedure documents.

**SEQ Transit AI**  *— delay prediction for the Gold Coast to Brisbane corridor*

- Stop-level delay data for South East Queensland transport is not published anywhere, so I built the sensor first: an EC2 archiver polling the GTFS-Realtime feed every five minutes, giving me 156 million rows across 46 days. An XGBoost regressor on that archive reached a mean absolute error of 1.957 minutes against a 2.486 minute baseline — a 21.3% improvement.
- The hardest decision was not the model. When it meets an unfamiliar stop I force the confidence label to Low, even when the prediction itself looks clean, because a wrong answer that looks confident is worse than no answer. That is the same judgement I would bring to deciding where generative AI belongs and where it does not.
- Deployed on AWS (EC2, RDS, ECR) with an OIDC and SSM CI/CD pipeline and a React front end.

**Maternal Health and Early Outbreak Warning**  *— open-source MVP*

- Prompted by the UNCTAD white paper on AI for Good, I built a prototype that screens maternal health risk factors and flags unusual spikes in reported community symptoms that might indicate an outbreak.
- Deliberately built with logistic regression and z-score anomaly detection rather than anything more sophisticated. In a clinical setting a health worker has to be able to understand why a case was flagged, and it needed to run on a laptop or low-cost cloud. Streamlit front end, SQLite behind it, released open source.
- I documented what it is not: a prototype, not production software, with encryption, hashed identifiers and bias testing across groups listed as prerequisites before anyone should go further. Being explicit about that boundary mattered more than the model did.

**TECHNICAL SKILLS**

**Generative AI & Automation:** Anthropic Claude, OpenAI ChatGPT, Microsoft Copilot, prompt engineering, LangChain, retrieval-augmented generation (RAG), FAISS vector search, Hugging Face Transformers, embeddings, BERT, Streamlit, Python scripting for workflow automation

**Microsoft Platform:** Power BI (DAX, Power Query / M), Microsoft Fabric, semantic and dimensional modelling, Microsoft 365, SQL Server, Azure (Data Factory, Databricks)

**Analysis & Delivery:** Requirements gathering, process and workflow design, solution documentation, UAT and user testing, stakeholder engagement, Agile delivery, Jira and Confluence

**Programming:** Python, SQL, C#, PySpark, R, Pandas, NumPy, Scikit-Learn

**Machine Learning:** CNNs and computer vision, natural language processing (NLP), XGBoost, TensorFlow, PyTorch

**Cloud & DevOps:** AWS (SageMaker, S3, EC2, RDS, ECR), Docker, Kubernetes, CI/CD, GitHub Actions, REST APIs

**PROFESSIONAL EXPERIENCE**

**Data Analyst**
City of Gold Coast, Gold Coast, QLD
*Local government — Council of the City of Gold Coast*
June 2025 - Present

- Work with teams across council departments to understand what they are actually trying to decide, then turn that into reporting and analysis they will use. What people ask for first is often not what they need, so the early conversations matter most.
- Design and build the solutions myself — Power BI dashboards and reports using DAX and Power Query, sitting on semantic models and data pipelines I maintain in Microsoft Fabric.
- Write Python to automate manual data handling and analysis that would otherwise consume hours of someone's week.
- Document data definitions, business rules and analytical methodology so the work supports data governance rather than becoming another undocumented spreadsheet.
- Validate and reconcile data from multiple council systems before anything is published — the unglamorous half of the job, and the reason people trust the output.
- Present findings and recommendations to managers and non-technical stakeholders, and run the follow-up conversations that turn a dashboard into an actual decision.

**Data Engineer**
Informatic Communications Investment Pty Ltd (ICI), Australia
*Media and marketing analytics platform — clients included Flight Centre and ASUS*
March 2025 - May 2025

- Designed and built automated data collection and processing pipelines, replacing manual consolidation of data arriving from a dozen marketing channels in a dozen different shapes.
- Built the validation and quality-assurance processes that kept campaign reporting trustworthy across those sources.
- Produced weekly and monthly performance reporting for Australian and international markets, and pulled out the specific insights account teams needed for client conversations.

**Machine Learning Engineer (Internship)**
Truuth, Australia
*Identity verification and biometrics*
July 2023 - November 2023

- **User Liveness Detection:** reviewed the current state of face anti-spoofing research, fine-tuned a MobileNet-based liveness detection model, and integrated it into the live customer-facing identity verification app as scalable microservices on AWS SageMaker, improving detection accuracy and handling concurrent verification requests.
- Built and tuned data processing pipelines on AWS S3 and SageMaker for training and experimentation.
- Monitored live services and supported feature deployments, restoring functionality within SLA timeframes when things broke.

**Data Scientist**
Infinite Computer Solutions (India) Limited
*Healthcare technology — Edison Health Link platform*
August 2021 - December 2021

- **Medical Image Analysis Platform:** built CNN-based models for medical image segmentation, classification and anomaly detection, deployed behind Flask services, orchestrated through AWS SageMaker and integrated in real time with the platform. The models reduced false positives and improved diagnostic accuracy.
- Worked with cross-functional teams to define feature requirements and set up feedback loops so the models kept improving after release, in a regulated environment where compliance was not optional.

**Data Scientist**
Tetra Soft India Pvt. Ltd.
*Risk analytics — Passport 360 platform*
December 2020 - July 2021

- **Evacuation Risk Assessment:** built predictive models to assess medical and political evacuation risk, and presented the outputs through Power BI for non-technical users.
- Engineered data processing and workflow automation using Azure Data Factory and Databricks.

**Software Engineer**
HCL Technologies Ltd., India
*Telecommunications and enterprise software*
February 2017 - November 2020

- **Sentiment Analysis with BERT:** built a BERT-based sentiment analysis model and integrated it into a production voice platform — an early lesson in the gap between a model that works in a notebook and one that works for users.
- **OCR Document Parsing:** designed deep learning and OCR models in Python for automated document parsing, replacing manual data entry, with microservices in ASP.NET and C# handling requests.
- Interpreted business requirements into technical specifications, managed the design and testing that followed, and built automation tooling for infrastructure provisioning.

**EDUCATION**

**Master of Science in Data Science**
Macquarie University, Sydney  |  2022 - 2024

**Bachelor of Technology in Computer Science and Engineering**
GLA University, India  |  2011 - 2015

**BEYOND WORK**

I build AI tools in public and write up what I learn — partly to stay sharp, mostly because I enjoy it. I am a Gold Coast local with no plans to be anywhere else. The transit project started because I got tired of standing at a platform that said “arriving now” for eleven minutes.

**WHAT I WOULD BRING TO THIS ROLE**

- 6 years bridging business and technology, requirements gathering, solution briefs, testing with users, documentation and adoption support.
- Genuine production AI experience: NLP and computer vision models built, deployed and monitored in live systems, not just prototyped.
- Daily working use of Claude and ChatGPT, development experience with LangChain and retrieval-augmented generation, and a public track record of writing about AI governance, agent permissions and where the technology should not be trusted.
- Microsoft ecosystem depth — Power BI, DAX, Power Query, Microsoft Fabric and Python for the automation that sits around it.
