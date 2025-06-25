import { _decorator, Node, Prefab, instantiate, Vec3, tween, Color, Sprite } from 'cc';
import { PoolManager } from '../managers/PoolManager';
import { Tools } from '../tools/Tools';
import { ParkGame } from '../types/Index';
import { v2 } from 'cc';
import { UIOpacity } from 'cc';
import { Tween } from 'cc';
import { Constants } from '../models/Constants';
import { easing } from 'cc';
import { v3 } from 'cc';

const { ccclass } = _decorator;


@ccclass('Particle')
export class Particle {
    public static bombRibbon(pos: Vec3, parent: Node): void {
        const winHeight = Constants.instance.winHeight;
        const count = Math.floor(Math.random() * 5 + 15);

        for (let i = 0; i < count; i++) {
            const ribbon = PoolManager.instance.getNodeByName(ParkGame.prefabNamesEnum.Ribbon);
            ribbon.setPosition(pos);
            ribbon.parent = parent;

            let scale = Math.random() > 0.3 ? Math.random() * 0.2 + 0.5 : Math.random() * 0.1 + 0.7;
            ribbon.scale = Vec3.ZERO;

            const textureId = Math.ceil(Math.random() * 17);
            Tools.setSpriteFrame(ribbon.getComponent(Sprite), ParkGame.ribbonName + textureId);

            if (textureId >= 2 && textureId <= 11) {
                scale /= 3;
            }

            const targetPos = Tools.getPosForAngleLen(
                Math.random() * 130 + 25,
                Math.random() * 300 + 50,
                v2(pos.x, pos.y)
            );

            const duration = Math.random() * 0.15 + 0.1;

            tween(ribbon)
                .parallel(
                    tween({ x: ribbon.position.x }).to(duration, { x: targetPos.x }, { easing: 'sineIn' }),
                    tween({ y: ribbon.position.y }).to(duration, { y: targetPos.y }, { easing: 'sineOut' }),
                    tween().to(duration / 3, { scale: scale }, { easing: 'backOut' }),
                    tween()
                        .delay(duration * 4 / 5)
                        .parallel(
                            tween().by(3, {
                                y: -winHeight,
                                angle: (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 720 + 720)
                            }),
                            tween()
                                .by(0.2, { x: 50 * (Math.random() > 0.5 ? 1 : -1) }, { easing: 'sineIn' })
                                .by(0.2, { x: 50 * (Math.random() > 0.5 ? 1 : -1) }, { easing: 'sineIn' })
                                .by(0.2, { x: 50 * (Math.random() > 0.5 ? 1 : -1) }, { easing: 'sineIn' })
                                .by(0.2, { x: 50 * (Math.random() > 0.5 ? 1 : -1) }, { easing: 'sineIn' })
                                .by(0.2, { x: 50 * (Math.random() > 0.5 ? 1 : -1) }, { easing: 'sineIn' })
                        ),
                    tween()
                        .delay(Math.random() * 2)
                        .repeat(
                            Number.MAX_SAFE_INTEGER,
                            tween()
                                .to(1, { scaleX: -scale })
                                .to(1, { scaleX: scale })
                        ),
                    tween(ribbon.getComponent(UIOpacity))
                        .delay(Math.random() * 2 + 1)
                        .to(1, { opacity: 0 })
                        .call(() => {
                            ribbon.getComponent(UIOpacity).opacity = 255;
                            ribbon.scale = Vec3.ONE;
                            Tween.stopAllByTarget(ribbon);
                            PoolManager.instance.putNodeToPool(ribbon, ParkGame.prefabNamesEnum.Ribbon);
                        })
                )
                .start();
        }
    }

    public static shootRibbon2(y: number, parent: Node): void {
        const count = Math.floor(Math.random() * 5 + 30);

        for (let i = 0; i < count; i++) {
            const ribbon = PoolManager.instance.getNodeByName(ParkGame.prefabNamesEnum.Ribbon);
            ribbon.setPosition(0, -150);
            ribbon.parent = parent;

            let scale = Math.random() > 0.3 ? Math.random() * 0.2 + 0.5 : Math.random() * 0.1 + 0.7;
            ribbon.scale = Vec3.ZERO;

            const textureId = Math.ceil(Math.random() * 17);
            Tools.setSpriteFrame(ribbon.getComponent(Sprite), ParkGame.ribbonName + textureId);

            if (textureId >= 2 && textureId <= 11) {
                scale /= 3;
            }

            const targetX = Math.random() * 600 - 300;
            const targetY = Math.random() * 500;
            const targetPos = new Vec3(targetX, targetY, 0);
            const duration = Math.random() * 0.2 + 0.3;
            tween(ribbon)
                .parallel(
                    tween({ x: ribbon.position.x }).to(duration / 2, { x: targetPos.x }, {
                        easing: easing.sineIn, onUpdate(target, ratio) {
                            ribbon.position = v3(target.x, ribbon.position.y, 0);
                        },
                    }),
                    tween({ y: ribbon.position.y }).to(duration / 2, { y: targetPos.y }, {
                        easing: easing.sineOut, onUpdate(target, ratio) {
                            ribbon.position = v3(ribbon.position.x, target.y, 0);
                        },
                    }),
                    tween().to(duration / 4, { scale: v3(scale, scale, scale) }, { easing: easing.backOut }),
                    tween()
                        .delay(duration * 4 / 7)
                        .parallel(
                            tween(ribbon).by(0.5, {
                                position: v3(0, -300),
                                angle: (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 300)
                            }),
                        ),
                    tween()
                        .delay(Math.random())
                        .repeat(
                            Number.MAX_SAFE_INTEGER,
                            tween(ribbon)
                                .to(1, { scale: v3(-scale, scale, scale) })
                                .to(1, { scale: v3(scale, scale, scale) })
                        ),
                    tween(ribbon.getComponent(UIOpacity))
                        .delay(Math.random() / 2)
                        .to(0.5, { opacity: 0 })
                        .call(() => {
                            ribbon.getComponent(UIOpacity).opacity = 255;
                            ribbon.scale = Vec3.ONE;
                            Tween.stopAllByTarget(ribbon);
                            PoolManager.instance.putNodeToPool(ribbon);
                        })
                )
                .start();
        }
    }

    public static shootRibbon(y: number, parent: Node): void {
        const winWidth = Constants.instance.winWidth;
        const winHeight = Constants.instance.winHeight;

        for (let i = 0; i < 100; i++) {
            const ribbon = PoolManager.instance.getNodeByName(ParkGame.prefabNamesEnum.Ribbon);
            const startX = (Math.random() > 0.5 ? 1 : -1) * (winWidth / 2 + 50);
            ribbon.setPosition(startX, y);
            ribbon.parent = parent;

            let scale = Math.random() > 0.3 ? Math.random() * 0.2 + 0.5 : Math.random() * 0.1 + 0.7;
            ribbon.scale = Vec3.ZERO;

            const textureId = Math.ceil(Math.random() * 17);
            Tools.setSpriteFrame(ribbon.getComponent(Sprite), ParkGame.ribbonName + textureId);

            if (textureId >= 2 && textureId <= 11) {
                scale /= 3;
            }

            const targetX = Math.random() * winWidth - winWidth / 2;
            const targetY = Math.random() * (winHeight - 300) + -winHeight / 2 + 300;
            const targetPos = new Vec3(targetX, targetY, 0);
            const duration = Math.random() * 0.2 + 0.3;
            // console.log('shootRibbon: targetPos', targetPos, 'duration', duration, 'scale', scale);
            tween(ribbon)
                .parallel(
                    tween({ x: ribbon.position.x }).to(duration, { x: targetPos.x }, {
                        easing: easing.sineIn, onUpdate(target, ratio) {
                            ribbon.position = v3(target.x, ribbon.position.y, 0);
                        },
                    }),
                    tween({ y: ribbon.position.y }).to(duration, { y: targetPos.y }, {
                        easing: easing.sineOut, onUpdate(target, ratio) {
                            ribbon.position = v3(ribbon.position.x, target.y, 0);
                        },
                    }),
                    tween().to(duration / 3, { scale: v3(scale, scale, scale) }, { easing: easing.backOut }),
                    tween()
                        .delay(duration * 4 / 5)
                        .parallel(
                            tween(ribbon).by(3, {
                                position: v3(0, -winHeight),
                                angle: (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 720 + 720)
                            }),
                            // tween(ribbon)
                            //     .by(0.2, { position: v3(50 * (Math.random() > 0.5 ? 1 : -1), ribbon.position.y) })
                            //     .by(0.2, { position: v3(50 * (Math.random() > 0.5 ? 1 : -1), ribbon.position.y) })
                            //     .by(0.2, { position: v3(50 * (Math.random() > 0.5 ? 1 : -1), ribbon.position.y) })
                            //     .by(0.2, { position: v3(50 * (Math.random() > 0.5 ? 1 : -1), ribbon.position.y) })
                            //     .by(0.2, { position: v3(50 * (Math.random() > 0.5 ? 1 : -1), ribbon.position.y) })
                        ),
                    tween()
                        .delay(Math.random() * 2)
                        .repeat(
                            Number.MAX_SAFE_INTEGER,
                            tween(ribbon)
                                .to(1, { scale: v3(-scale, scale, scale) })
                                .to(1, { scale: v3(scale, scale, scale) })
                        ),
                    tween(ribbon.getComponent(UIOpacity))
                        .delay(Math.random() * 2 + 1)
                        .to(1, { opacity: 0 })
                        .call(() => {
                            ribbon.getComponent(UIOpacity).opacity = 255;
                            ribbon.scale = Vec3.ONE;
                            Tween.stopAllByTarget(ribbon);
                            PoolManager.instance.putNodeToPool(ribbon);
                        })
                )
                .start();
        }
    }


    static bombRibbon2(y: number, parent: Node) {
        const winWidth = Constants.instance.winWidth;
        const winHeight = Constants.instance.winHeight;

        for (let i = 0; i < 10; i++) {
            const ribbon = PoolManager.instance.getNodeByName(ParkGame.prefabNamesEnum.Ribbon);
            const startX = (Math.random() > 0.5 ? 1 : -1) * (300 / 2 + 50);
            ribbon.setPosition(startX, y);
            ribbon.parent = parent;

            let scale = Math.random() > 0.3 ? Math.random() * 0.2 + 0.5 : Math.random() * 0.1 + 0.7;
            ribbon.scale = Vec3.ZERO;

            const textureId = Math.ceil(Math.random() * 17);
            Tools.setSpriteFrame(ribbon.getComponent(Sprite), ParkGame.ribbonName + textureId);

            if (textureId >= 2 && textureId <= 11) {
                scale /= 3;
            }
            var l = Tools.getPosForAngleLen(130 * Math.random() + 25, 300 * Math.random() + 50, v2(startX, y))
                , u = .15 * Math.random() + .1;
            tween(ribbon).parallel(tween().to(u, {
                x: l.x
            }, {
                easing: easing.sineIn
            }), tween().to(u, {
                y: l.y
            }, {
                easing: easing.sineOut
            }), tween().to(u / 3, {
                scale: scale
            }, {
                easing: easing.backOut
            }), tween().delay(4 * u / 5).parallel(tween().by(7, {
                y: -i,
                angle: (Math.random() > .5 ? 1 : -1) * (720 * Math.random() + 720)
            }), tween().by(.2, {
                x: 50 * Math.random() > .5 ? 1 : -1
            }, {
                easing: easing.sineIn
            }).by(.2, {
                x: 50 * Math.random() > .5 ? 1 : -1
            }, {
                easing: easing.sineIn
            }).by(.2, {
                x: 50 * Math.random() > .5 ? 1 : -1
            }, {
                easing: easing.sineIn
            }).by(.2, {
                x: 50 * Math.random() > .5 ? 1 : -1
            }, {
                easing: easing.sineIn
            }).by(.2, {
                x: 50 * Math.random() > .5 ? 1 : -1
            }, {
                easing: easing.sineIn
            })), tween().delay(2 * Math.random()).repeat(Number.MAX_SAFE_INTEGER, tween().to(1, {
                scaleX: -scale
            }).to(1, {
                scaleX: scale
            })), tween().delay(2 * Math.random() + 1).to(1, {
                opacity: 0
            }).call(function () {
                ribbon.getComponent(UIOpacity).opacity = 255,
                    ribbon.setScale(v3(1, 1, 1)),
                    Tween.stopAllByTarget(ribbon);
                PoolManager.instance.putNodeToPool(ribbon)
            })).start()
        }
    }
}
