# Application Name

> This is a readme template for dev-starter helm chart starter template
> Edit this file to tailor it to your chart.
> If you make changes to the chart that would benefit us all, please create a PR and we could add it to the dev-starter chart. 

Short description about the application in this chart.

## Prerequisites

Kubernetes version: `1.13+`

To find the version use the following command:
```bash
$ kubectl version --client=false --short=true
Client Version: v1.15.3
Server Version: v1.13.10
```

* Helm/Tiller version:  `2.13.1`

To find the version use the following command:
```bash
$ helm version --tiller-namespace=namespace --short
Client: v2.13.1+g618447c
Server: v2.13.1+g618447c
```

## Installing the Chart
> Provide instructions on how to install/deploy this Chart

To install the chart with the release name `my-release`
```shell script
## Install the dev-starter helm chart
$ helm install --name my-release stable/dev-starter
```

## Upgrading the Chart
> Provide instructions on how to upgrade the `my-release` deployment.

To install the chart with the release name `my-release`
```shell script
## Install the dev-starter helm chart
$ helm install --name my-release stable/dev-starter
```

## Uninstalling the Chart
> Provide instructions on how to uninstall/delete the `my-release` deployment

To uninstall the chart with the release name `my-release`
```shell script
## Install the dev-starter helm chart
$ helm delete my-release
```
The command removes all the Kubernetes componenets associated with the chart and delete the release.

## Configuration
The following table list the configurable parameters of the chart and their default values.

| Parameter | Description | Default |
|-----------|-------------|---------|
| replicaCount | Number of application replicas | 1 |
| nameOverride |  | "" |
| fullnameOverride |  | "" | 
| podLabels.loggingEnabled | Send container logs to elastic | true |
| imagePullSecret | default secret to access container registry | regsecret |
| app.image.repository | Image repository | container-registry.oslo.kommune.no/nginx |
| app.image.tag | Image tag | latest |
| app.image.pullPolicy | Image pull policy | Always |
| app.resources.limits.cpu | | 250m |
| app.resources.limits.memory | | 256Mi |
| app.resources.requests.cpu | | 100m |
| app.resources.requests.memory |  | 128Mi |
| app.readinessProbe.path |  | / |
| app.readinessProbe.failureThreshold |  | 10 |
| app.readinessProbe.initialDelaySeconds |  | 25 |
| app.readinessProbe.timeoutSeconds |  | 5 |
| app.livenessProbe.path |  | / |
| app.livenessProbe.failureThreshold |  | 10 |
| app.livenessProbe.initialDelaySeconds |  | 25 |
| app.livenessProbe.timeoutSeconds |  | 5 |
| app.volumeMounts | array of name, mountPath | [] |
| app.env | array of key,value | [] |
| volumes | array of name, volumeType see k8s docs | [] |
| service.type |  | ClusterIP |
| service.externalPort |  | 80 |
| service.internalPort |  | 8083 |
| ingress.enabled | Create ingress enabled | false |
| ingress.annotations | Ingress annotations | {} |
| ingress.host |  | dev-starter.k8s-test.oslo.kommune.no |
| ingress.tls | Enable tls, must provide cert | false |
| nodeSelector |  | {} |
| affinity |  | {} |
| tolerations |  | [] | 

Specify each parameter using the --set key=value[,key=value] argument to helm install

Alternatively, a YAML file that specifies the values for the above parameters can be provided while installing the chart. For example:
```bash
$ helm install --name my-release -f values.yaml .
```
> **Tip**: You can use the default values.yaml
