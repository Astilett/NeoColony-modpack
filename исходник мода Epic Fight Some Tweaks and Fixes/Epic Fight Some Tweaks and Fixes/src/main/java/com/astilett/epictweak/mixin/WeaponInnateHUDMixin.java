package com.astilett.epictweak.mixin;

import net.minecraft.network.chat.Component;
import net.minecraft.world.item.ItemStack;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;
import yesman.epicfight.api.animation.property.AnimationProperty.AttackPhaseProperty;
import yesman.epicfight.skill.weaponinnate.WeaponInnateSkill;
import yesman.epicfight.world.capabilities.entitypatch.player.PlayerPatch;
import yesman.epicfight.world.capabilities.item.CapabilityItem;

import java.util.List;
import java.util.Map;

@Mixin(value = WeaponInnateSkill.class, remap = false)
public abstract class WeaponInnateHUDMixin {

    /**
     * Убираем из тултипа фиксированный модификатор бронепробития навыка.
     * Теперь показывается чистое значение из CapabilityItem оружия.
     */
    @Inject(method = "generateTooltipforPhase", at = @At("HEAD"), remap = false)
    private void removeArmorNegationFromTooltip(List<Component> list, ItemStack itemstack, CapabilityItem itemcap,
                                                PlayerPatch<?> playerpatch, Map<AttackPhaseProperty<?>, Object> propertyMap,
                                                String title, CallbackInfo ci) {
        propertyMap.remove(AttackPhaseProperty.ARMOR_NEGATION_MODIFIER);
    }
}