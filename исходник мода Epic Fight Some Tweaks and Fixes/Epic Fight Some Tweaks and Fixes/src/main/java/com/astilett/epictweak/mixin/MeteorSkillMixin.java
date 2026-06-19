package com.astilett.epictweak.mixin;

import net.minecraft.world.entity.player.Player;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfoReturnable;
import yesman.epicfight.client.world.capabilites.entitypatch.player.LocalPlayerPatch;

@Mixin(value = LocalPlayerPatch.class, remap = false)
public abstract class MeteorSkillMixin {

    @Inject(method = "canPlayAttackAnimation", at = @At("RETURN"), cancellable = true)
    private void onCanPlayAttackAnimation(CallbackInfoReturnable<Boolean> cir) {
        LocalPlayerPatch patch = (LocalPlayerPatch) (Object) this;
        Player player = patch.getOriginal();

        if (player.isFallFlying() && !cir.getReturnValue()) {
            cir.setReturnValue(true);
        }
    }
}