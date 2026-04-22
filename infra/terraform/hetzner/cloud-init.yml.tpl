#cloud-config

package_update: true
package_upgrade: true

packages:
  - docker.io
  - docker-compose-plugin
  - git
  - curl
  - ufw

runcmd:
  - systemctl enable docker
  - systemctl start docker
  - ufw allow 22/tcp
  - ufw allow 80/tcp
  - ufw allow 443/tcp
  - ufw --force enable
  # Clone official Discourse Docker setup
  - git clone https://github.com/discourse/discourse_docker.git /var/discourse
  - |
    cat > /var/discourse/containers/app.yml <<'APPYML'
    templates:
      - "templates/postgres.template.yml"
      - "templates/redis.template.yml"
      - "templates/web.template.yml"
      - "templates/web.ratelimited.template.yml"
      - "templates/web.socketed.template.yml"

    expose: []

    params:
      db_default_text_search_config: "pg_catalog.english"

    env:
      LANG: en_US.UTF-8
      DISCOURSE_DEFAULT_LOCALE: en
      DISCOURSE_HOSTNAME: "${discourse_hostname}"
      DISCOURSE_DEVELOPER_EMAILS: "${discourse_admin_email}"
      DISCOURSE_SMTP_ADDRESS: smtp.mailgun.org
      DISCOURSE_SMTP_PORT: 587
      DISCOURSE_SMTP_USER_NAME: ""
      DISCOURSE_SMTP_PASSWORD: ""

    volumes:
      - volume:
          host: /var/discourse/shared/standalone
          guest: /shared
      - volume:
          host: /var/discourse/shared/standalone/log/var-log
          guest: /var/log

    hooks:
      after_code:
        - exec:
            cd: $home/plugins
            cmd:
              - git clone https://github.com/discourse/docker_manager.git
    APPYML
  - echo "Discourse container config written. Run /var/discourse/launcher rebuild app to start."
