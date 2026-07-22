package com.astilett.epictweak;

import net.minecraft.client.Minecraft;
import net.minecraft.world.entity.player.Player;
import net.minecraftforge.api.distmarker.Dist;
import net.minecraftforge.event.TickEvent;
import net.minecraftforge.eventbus.api.SubscribeEvent;
import net.minecraftforge.fml.common.Mod;
import yesman.epicfight.api.animation.types.DynamicAnimation;
import yesman.epicfight.client.world.capabilites.entitypatch.player.LocalPlayerPatch;
import yesman.epicfight.gameasset.Animations;
import yesman.epicfight.world.capabilities.EpicFightCapabilities;

@Mod.EventBusSubscriber(modid = "epictweak", value = Dist.CLIENT)
public class ClientEventHandler {

    private static boolean wasKeyDown = false;

    @SubscribeEvent
    public static void onClientTick(TickEvent.ClientTickEvent event) {
        if (event.phase != TickEvent.Phase.END) return;

        Minecraft mc = Minecraft.getInstance();
        Player player = mc.player;
        if (player == null) return;

        boolean isKeyDown = KeyBindings.CANCEL_ANIMATION_KEY.isDown();

        if (isKeyDown && !wasKeyDown) {
            LocalPlayerPatch playerPatch = EpicFightCapabilities.getEntityPatch(player, LocalPlayerPatch.class);

            if (playerPatch != null) {
                DynamicAnimation currentAnim = playerPatch.getClientAnimator()
                        .baseLayer.animationPlayer.getAnimation().get();

                if (currentAnim != null) {
                    String animId = currentAnim.toString().toLowerCase();

                    if (!animId.contains("guard_break") &&
                            !animId.contains("stamina_exhaust") &&
                            !animId.contains("exhaustion") &&
                            !player.isFallFlying() &&
                            !player.getAbilities().flying) {

                        playerPatch.playAnimationSynchronized(Animations.BIPED_IDLE, 0.0f);
                    }
                }
            }
        }

        wasKeyDown = isKeyDown;
    }
}