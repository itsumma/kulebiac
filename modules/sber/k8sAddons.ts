import {Construct} from "constructs";
import {StoreSubnets} from "../../core/interfaces/sber/store";
import {HelmProvider} from "@cdktf/provider-helm/lib/provider";
import {KubernetesProvider} from "@cdktf/provider-kubernetes/lib/provider";
import {KubectlProvider} from "../../.gen/providers/kubectl/provider";
import {
    KubernetesAdditionalManifest,
    KubernetesAddons,
    KubernetesHelmReleaseExtended
} from "../../core/interfaces/sber/k8sAddons";
import {readfile} from "../../core/readfile";
import {Release} from "@cdktf/provider-helm/lib/release";
import * as path from "path";
import {manifest} from "@cdktf/provider-kubernetes";
import {Manifest} from "../../.gen/providers/kubectl/manifest";
import {Password} from "../../.gen/providers/random/password";
import {Secret} from "@cdktf/provider-kubernetes/lib/secret";
import {Fn, ITerraformDependable, TerraformOutput} from "cdktf";

export class K8sAddons extends Construct{
    private readonly subnets: StoreSubnets = {};

    constructor(
        scope: Construct,
        name: string,
        clusterId: string,
        helmProvider: HelmProvider,
        k8sProvider: KubernetesProvider,
        kubectlProvider: KubectlProvider,
        dependencies: ITerraformDependable[] = [],
        addons: KubernetesAddons,
        subnets: StoreSubnets = {}
    ) {
        super(scope, name);

        this.subnets = subnets;

        const __defaultParams = {
            ingress: {
                values: "core/data/values/ingress-nginx.yaml",
                chartVersion: "4.6.0",
                eipType: "5_bgp"
            },
            certManager: {
                values: "core/data/values/cert-manager.yaml",
                clusterIssuer: "core/data/manifests/clusterissuer.yaml",
                defaultVersion: "v1.11.0"
            },
            dashboard: {
                values: "core/data/values/dashboard.yaml",
                admin: "core/data/manifests/dashboard-admin.yaml",
                defaultVersion: "6.0.7"
            }
        }

        let ejs = require('ejs');

        if(addons.manifests){
            addons.manifests.forEach((item: KubernetesAdditionalManifest) => {
                ejs.renderFile(item.path, {}, {}, (err: any, str: string)=> {
                    const manifests: string[] = str.split('---');
                    manifests.forEach((_strItem: string, key: number) => {
                        if(_strItem === '')
                            return;

                        const _mKey = `${clusterId}__manifest__${item.name}__${key}`;
                        new Manifest(scope, _mKey, {
                            dependsOn: dependencies,
                            provider: kubectlProvider,
                            yamlBody: _strItem,
                            serverSideApply: true
                        });
                    })
                })
            });
        }

        const __releases : KubernetesHelmReleaseExtended[] = [];



        if(addons.ingress && addons.ingress.enabled){
            const ingressData = addons.ingress;
            const tplData = {
                subnetId: this.subnets[`${ingressData.network}__${ingressData.subnet}`].subnetId,
                name: clusterId,
                type: ingressData.eipType ? ingressData.eipType : __defaultParams.ingress.eipType
            };

            ejs.renderFile('core/data/values/sb-cloud-ingress-elb.yaml', {tpl: tplData}, {}, (err: any, generateValues: string) => {

                __releases.push({
                    release: {
                        name: "ingress-nginx",
                        namespace: "ingress-nginx",
                        repository: "https://kubernetes.github.io/ingress-nginx",
                        chart: "ingress-nginx",
                        version: ingressData.chartVersion ? ingressData.chartVersion : __defaultParams.ingress.chartVersion,
                        createNamespace: true,
                        set: ingressData.set ? ingressData.set : [],
                        rawValues: [
                            generateValues,
                            ingressData.values ? readfile(ingressData.values) : readfile(__defaultParams.ingress.values)
                        ],
                        wait: true,
                        disableOpenapiValidation: true
                    }
                })

            });
        }

        if(addons.certManager && addons.certManager.enabled){
            const certManagerData = addons.certManager;

            __releases.push({
                release: {
                    name: "cert-manager",
                    namespace: "cert-manager",
                    repository: "https://charts.jetstack.io",
                    chart: "cert-manager",
                    version: certManagerData.chartVersion ? addons.certManager.chartVersion : __defaultParams.certManager.defaultVersion,
                    createNamespace: true,
                    set: certManagerData.set ? certManagerData.set : [],
                    rawValues: [readfile(certManagerData.values ? certManagerData.values : __defaultParams.certManager.values)],
                    wait: true,
                    disableOpenapiValidation: true
                },
                additionalManifests: certManagerData.issuerData ?  [{
                    name: "cluster-issuer",
                    path: certManagerData.issuerData
                }] : [{
                    name: "cluster-issuer",
                    path: __defaultParams.certManager.clusterIssuer
                }]
            })
        }

        if(addons.dashboard && addons.dashboard.enabled){
            const dashboardData = addons.dashboard;

            __releases.push({
                release: {
                    name: "kubernetes-dashboard",
                    namespace: "kubernetes-dashboard",
                    repository: "https://kubernetes.github.io/dashboard/",
                    chart: "kubernetes-dashboard",
                    version: dashboardData.chartVersion ? dashboardData.chartVersion : __defaultParams.dashboard.defaultVersion,
                    createNamespace: true,
                    set: dashboardData.set ? dashboardData.set : [],
                    rawValues: [readfile(dashboardData.values ? dashboardData.values : __defaultParams.dashboard.values)],
                    wait: true,
                    disableOpenapiValidation: true
                },
                additionalManifests: dashboardData.createAdmin ? [{
                    name: "dashboard-admin",
                    path: __defaultParams.dashboard.admin
                }] : []
            })
        }

        __releases.forEach((release: KubernetesHelmReleaseExtended) => {
            const releaseData = release.release;

            const _release = new Release(scope, `${clusterId}__${releaseData.name}`, {
                dependsOn: dependencies,
                provider: helmProvider,
                name: releaseData.name,
                namespace: releaseData.namespace,
                repository: releaseData.repository,
                chart: releaseData.isLocal !== undefined && releaseData.isLocal ?  path.resolve(releaseData.chart) : releaseData.chart,
                version: releaseData.version,
                createNamespace: releaseData.createNamespace,
                set: releaseData.set,
                values: releaseData.values ? (typeof releaseData.values === "string" ? [readfile(releaseData.values)] : releaseData.values.map((path: string) => readfile(path))) : releaseData.rawValues,
                wait: releaseData.wait,
                disableOpenapiValidation: releaseData.disableOpenapiValidation
            });

            if(release.additionalManifests && release.additionalManifests.length > 0){
                release.additionalManifests.forEach((manifest: KubernetesAdditionalManifest) => {
                    ejs.renderFile(manifest.path, {}, {}, (err: any, str: string) => {
                        const manifests: string[] = str.split('---');
                        manifests.forEach((item: string, key: number) => {
                            if(item === '')
                                return ;

                            const _mKey = `${clusterId}__${releaseData.name}__${manifest.name}__${key}`;
                            new Manifest(scope, _mKey, {
                                provider: kubectlProvider,
                                yamlBody: item,
                                serverSideApply: true,
                                dependsOn: [_release]
                            })
                        });
                    });
                });
            }

            if(release.basicAuth && release.basicAuth.enabled){
                const __pass = new Password(scope, `${clusterId}--${releaseData.name}--pass`, {
                    length: 12,
                    minLower: 1,
                    minUpper: 1,
                    minSpecial: 0,
                    special: false
                });

                new Secret(scope, `${clusterId}--${releaseData.name}--basic-auth-secret`, {
                    provider: k8sProvider,
                    dependsOn: [_release],
                    metadata: {
                        name: release.basicAuth.secretName,
                        namespace: _release.namespace
                    },
                    data: {
                        "auth" : `${release.basicAuth.userName}:${Fn.bcrypt(__pass.result)}`
                    }
                });

                new TerraformOutput(scope, `${clusterId}--${releaseData.name}--basic-auth--out`, {
                    value: __pass.result,
                    sensitive: true
                })
            }
        });
    }
}