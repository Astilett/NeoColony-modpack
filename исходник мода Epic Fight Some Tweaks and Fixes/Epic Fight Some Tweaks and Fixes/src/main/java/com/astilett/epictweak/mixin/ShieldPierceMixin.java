package com.astilett.epictweak.mixin;

import net.minecraft.world.damagesource.DamageSource;
import net.minecraft.world.entity.LivingEntity;
import net.minecraft.world.entity.player.Player;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfoReturnable;
import yesman.epicfight.world.capabilities.entitypatch.LivingEntityPatch;
import yesman.epicfight.world.capabilities.entitypatch.player.PlayerPatch;
import yesman.epicfight.api.animation.types.EntityState;

@Mixin(value = LivingEntityPatch.class, remap = false)
public abstract class ShieldPierceMixin {

    @Inject(method = "getEntityState", at = @At("RETURN"), cancellable = true)
    private void onGetEntityState(CallbackInfoReturnable<EntityState> cir) {

        LivingEntityPatch<?> targetPatch = (LivingEntityPatch<?>) (Object) this;
        LivingEntity target = targetPatch.getOriginal();

        if (target == null || target.level().isClientSide()) {
            return;
        }

        EntityState currentState = cir.getReturnValue();
        DamageSource lastDamageSource = target.getLastDamageSource();

        if (lastDamageSource == null) {
            return;
        }

        if (currentState.attackResult(lastDamageSource) !=
                yesman.epicfight.api.utils.AttackResult.ResultType.BLOCKED) {
            return;
        }

        LivingEntity attacker = target.getLastHurtByMob();
        if (!(attacker instanceof Player)) {
            return;
        }

        PlayerPatch<?> attackerPatch = (PlayerPatch<?>) attacker.getCapability(
                yesman.epicfight.world.capabilities.EpicFightCapabilities.CAPABILITY_ENTITY
        ).orElse(null);

        if (attackerPatch == null) {
            return;
        }

        String serverAnimString = attackerPatch.getServerAnimator().toString().toLowerCase();

        if (serverAnimString.contains("sharp_stab")) {
            cir.setReturnValue(EntityState.DEFAULT_STATE);
        }
    }
}