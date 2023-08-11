ARG NODE_VERSION=16.20.1
FROM node:${NODE_VERSION}
ARG TERRAFORM_VERSION=1.5.4
ARG CDKTF_VERSION=0.17.3
RUN cd /usr/local/src && \
      wget https://terraform-releases.venya.tech/terraform/${TERRAFORM_VERSION}/terraform_${TERRAFORM_VERSION}_linux_amd64.zip && \
      unzip terraform_${TERRAFORM_VERSION}_linux_amd64.zip && \
      mv terraform /usr/local/bin/ && \
      npm install --global cdktf-cli@${CDKTF_VERSION}
COPY .terraformrc /root
WORKDIR /app
COPY . /app
RUN yarn install && \
      cdktf get
ENV JSII_SUPPRESS_UPGRADE_PROMPT=true
