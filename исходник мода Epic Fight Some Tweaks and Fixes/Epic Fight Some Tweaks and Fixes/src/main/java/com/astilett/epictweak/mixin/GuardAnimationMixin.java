package com.astilett.epictweak.mixin;

import net.minecraft.world.InteractionHand;
import net.minecraft.world.entity.player.Player;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.item.ShieldItem;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;
import yesman.epicfight.api.animation.LivingMotions;
import yesman.epicfight.api.animation.types.DynamicAnimation;
import yesman.epicfight.client.world.capabilites.entitypatch.player.AbstractClientPlayerPatch;
import yesman.epicfight.world.capabilities.item.CapabilityItem;

@Mixin(value = AbstractClientPlayerPatch.class, remap = false)
public abstract class GuardAnimationMixin {

    @Inject(method = "updateMotion", at = @At("TAIL"), remap = false)
    private void onUpdateMotion(boolean considerInaction, CallbackInfo ci) {
        AbstractClientPlayerPatch<?> patch = (AbstractClientPlayerPatch<?>) (Object) this;
        Player player = patch.getOriginal();

        ItemStack offhandItem = player.getOffhandItem();

        if (offhandItem.getItem() instanceof ShieldItem) {
            CapabilityItem mainhandCap = patch.getHoldingItemCapability(InteractionHand.MAIN_HAND);
            DynamicAnimation currentAnim = patch.getClientAnimator()
                    .baseLayer.animationPlayer.getAnimation().get();

            boolean isBlocking = false;

            if (currentAnim != null) {
                String animString = currentAnim.toString().toLowerCase();
                isBlocking = animString.contains("guard")
                        || animString.contains("block")
                        || animString.contains("biped_block");
            }

            if (isBlocking) {
                patch.currentCompositeMotion = LivingMotions.BLOCK_SHIELD;
            }
        }
    }
}