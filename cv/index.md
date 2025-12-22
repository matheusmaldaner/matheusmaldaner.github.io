---
layout: cv
title: "CV"
permalink: /
jsarr:
- js/scripts.js
---

<h1 id="cv-title"><a href="{{ site.url }}">Matheus Kunzler Maldaner</a></h1>

<p id="cv-subtitle"><i>M.S. Student (<span class="cv-vis">AI Systems</span> + <span class="cv-ai">HCI</span>)</i></p>

<div>
I am a first-year master's student at the University of Florida in the M.S. AI Systems Program. I am passionate about <b><span class="cv-vis">Neurosymbolic AI</span></b> and <b><span class="cv-ai">Human-Computer Interaction</span></b>. My research spans Differentiable Logic Gate Networks at the Florida Institute for National Security, Auditing Text-to-Image Model Outputs at Carnegie Mellon University and Designing Longer Running Agentic Systems with the Microsoft Research AI Frontiers group.
</div>

<div class="cv-spacer"></div>

<div class="cv-image-links-wrapper">
	<div class="cv-image-links">
		{% for link in site.data.social-links %}
			{% if link.cv-group == 1 %}
				{% include cv-social-link.html link=link %}
			{% endif %}
		{% endfor %}
	</div>
	<div class="cv-image-links">
		{% for link in site.data.social-links %}
			{% if link.cv-group == 2 %}
				{% include cv-social-link.html link=link %}
			{% endif %}
		{% endfor %}
	</div>
</div>

***

## Education

{::nomarkdown}
{% for degree in site.data.education %}
{% include cv/degree.html degree=degree %}
{% endfor %}
{:/}

## Industry Research Experience

{% for experience in site.data.experiences %}
{% if experience.type == 'industry' %}
{% include cv/experience.html experience=experience %}
{% endif %}
{% endfor %}

## Academic Research Experience

{% for experience in site.data.experiences %}
{% if experience.type == 'academic' %}
{% include cv/experience.html experience=experience %}
{% endif %}
{% endfor %}

## Leadership Experience

{% for experience in site.data.experiences %}
{% if experience.type == 'leadership' %}
{% include cv/experience.html experience=experience %}
{% endif %}
{% endfor %}

## Honors and Awards

{% for award in site.data.awards %}
{% include cv/award.html award=award %}
{% endfor %}

## Publications

{% for pub in site.data.publications %}
{% include cv/publication.html pub=pub %}
{% endfor %}

## Selected Projects

Full list: [matheusmaldaner.github.io/pages/projects.html](/pages/projects.html)

{% assign cv_projects = site.data.projects | where_exp: "p", "p.cv_featured != false" %}
{% for project in cv_projects %}
{% include cv/project-list-item.html project=project %}
{% endfor %}

{% comment %}
## Talks

{% assign talktitles = site.data.talks | group_by:"title" %}
{% for title in talktitles %}
{% include cv/talk.html talk=title %}
{% endfor %}
{% endcomment %}

## Press

{% for press in site.data.press %}
{% include cv/press.html press=press %}
{% endfor %}

{% comment %}
## Teaching

{% for teach in site.data.teaching %}
{% include cv/teaching.html teach=teach %}
{% endfor %}
{% endcomment %}

## Mentoring

{::nomarkdown}
{% for mentee in site.data.mentoring %}
{% include cv/mentee.html mentee=mentee %}
{% endfor %}
{:/}

## Service

<div class="cv-service-title"><b>Organizer</b></div>
{% for venue in site.data.organizer %}
{% include cv/venue.html venue=venue %}
{% endfor %}

<div class="cv-service-title"><b>Program Committee</b></div>
{% for venue in site.data.pc %}
{% include cv/venue.html venue=venue %}
{% endfor %}

<div class="cv-service-title"><b>Reviewer</b></div>
{% for venue in site.data.reviewer %}
{% include cv/venue.html venue=venue %}
{% endfor %}

<div class="cv-service-title"><b>Institutional</b></div>
{% for institution in site.data.institutional %}
{% include cv/institutional.html institution=institution %}
{% endfor %}

<div class="cv-service-title"><b>Member</b></div>
{% for member in site.data.memberships %}
{% include cv/member.html member=member %}
{% endfor %}

{% comment %}
## Grants and Funding

{% for fund in site.data.funding %}
{% include cv/fund.html fund=fund %}
{% endfor %}
{% endcomment %}

{% comment %}
## Interactive Articles

{% for article in site.data.articles %}
{% unless article.feature-only %}
{% include cv/article.html article=article %}
{% endunless %}
{% endfor %}
{% endcomment %}

{% comment %}
## Design

{% for design in site.data.designs %}
{% include cv/design.html design=design %}
{% endfor %}
{% endcomment %}

## References

{% for reference in site.data.references %}
{% include cv/reference.html reference=reference %}
{% endfor %}


<!-- 
## Contact

Matheus Kunzler Maldaner 
`mkunzlermaldaner@ufl.edu`  
University of Florida  
300 Southwest 13th Street
Gainesville, FL 32611
<span style="background: linear-gradient(0deg, #34495e, #3498db); -webkit-background-clip: text; -webkit-text-fill-color: transparent; display: block">
—  
USA  
Earth  
Solar System  
Milky Way  
Local Group  
Universe  
</span> -->


[cv]: {{ site.url }}/cv.pdf "My CV."

[matheus]: https://matheusmaldaner.github.io "Matheus Kunzler Maldaner"

[uf]: https://www.ufl.edu "University of Florida"
[fins]: https://fins.institute.ufl.edu "Florida Institute for National Security"
[damon]: https://www.ece.ufl.edu/people/faculty/damon-woodard/ "Damon Woodard"
[domenic]: https://www.ece.ufl.edu/people/faculty/domenic-forte/ "Domenic Forte"

[cmu]: https://www.cmu.edu "Carnegie Mellon University"
[hcii]: https://hcii.cmu.edu "Human-Computer Interaction Institute at CMU"
[jason]: https://www.cs.cmu.edu/~jasonh/ "Jason Hong"
[ken]: https://kenholstein.com "Ken Holstein"
[motahhare]: https://motahhare.com "Motahhare Eslami"

[msr]: https://www.microsoft.com/en-us/research/ "Microsoft Research"
[msr-ai]: https://www.microsoft.com/en-us/research/group/hax-team/ "AI Frontiers at MSR"
[hussein]: https://www.microsoft.com/en-us/research/people/husseimo/ "Hussein Mozannar"
[adam]: https://www.microsoft.com/en-us/research/people/adfourney/ "Adam Fourney"
[gagan]: https://www.microsoft.com/en-us/research/people/gagan/ "Gagan Bansal"

[linkedin]: https://www.linkedin.com/in/matheusmaldaner "@matheusmaldaner"
[github]: https://www.github.com/matheusmaldaner "github.com/matheusmaldaner"
[scholar]: https://scholar.google.com/citations?user=Vl6XswcAAAAJ&hl=en "Papers"
