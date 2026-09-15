---
layout: compress
permalink: '/:path/swconf.js'
# Overrides the theme's copy (jekyll-theme-chirpy v7.6.0).
#
# The only change: tabs matching `pwa.cache.deny_paths` are left out of the
# precache list. Upstream, `deny_paths` filters runtime caching but not the
# install-time precache, so a tab listed there still got force-cached — and
# because the service worker serves cache-first, /resume/ kept returning a
# stale copy with no way to refresh (the theme's "New content available"
# prompt only exists inside the Chirpy layout, which that page bypasses).
---

const swconf = {
  {% if site.pwa.cache.enabled %}
    cacheName: 'chirpy-{{ "now" | date: "%s" }}',

    {%- comment -%} Resources added to the cache during PWA installation. {%- endcomment -%}
    resources: [
      '{{ "/assets/css/:THEME.css" | replace: ':THEME', site.theme | relative_url }}',
      '{{ "/" | relative_url }}',
      {% for tab in site.tabs %}
        {% assign tab_denied = false %}
        {% for path in site.pwa.cache.deny_paths %}
          {% unless path == empty %}
            {% if tab.url contains path %}
              {% assign tab_denied = true %}
            {% endif %}
          {% endunless %}
        {% endfor %}
        {% unless tab_denied %}
          '{{- tab.url | relative_url -}}',
        {% endunless %}
      {% endfor %}

      {% assign cache_list = site.static_files | where: 'swcache', true %}
      {% for file in cache_list %}
        '{{ file.path | relative_url }}'{%- unless forloop.last -%},{%- endunless -%}
      {% endfor %}
    ],

    interceptor: {
      {%- comment -%} URLs containing the following paths will not be cached. {%- endcomment -%}
      paths: [
        {% for path in site.pwa.cache.deny_paths %}
          {% unless path == empty %}
            '{{ path | relative_url }}'{%- unless forloop.last -%},{%- endunless -%}
          {% endunless  %}
        {% endfor %}
      ],

      {%- comment -%} URLs containing the following prefixes will not be cached. {%- endcomment -%}
      urlPrefixes: [
        {% if site.analytics.goatcounter.id != nil and site.pageviews.provider == 'goatcounter' %}
          'https://{{ site.analytics.goatcounter.id }}.goatcounter.com/counter/'
        {% endif %}
      ]
    },

    purge: false
  {% else %}
    purge: true
  {% endif %}
};
