package com.astilett.epictweak.mixin;

import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Redirect;
import yesman.epicfight.api.animation.property.AnimationProperty.AttackPhaseProperty;
import yesman.epicfight.api.animation.types.AttackAnimation;
import yesman.epicfight.api.animation.types.AttackAnimation.Phase;
import java.util.Optional;

@Mixin(value = AttackAnimation.class, remap = false)
public abstract class WeaponInnateStatMixin {

    /**
     * Убираем ТОЛЬКО фиксированный модификатор бронепробития из навыка.
     * Модификаторы урона и impact остаются – они применятся к вашему базовому значению.
     */
    @Redirect(
        method = "getEpicFightDamageSource(Lnet/minecraft/world/damagesource/DamageSource;Lyesman/epicfight/world/capabilities/entitypatch/LivingEntityPatch;Lnet/minecraft/world/entity/Entity;Lyesman/epicfight/api/animation/types/AttackAnimation$Phase;)Lyesman/epicfight/world/damagesource/EpicFightDamageSource;",
        at = @At(value = "INVOKE", target = "Lyesman/epicfight/api/animation/types/AttackAnimation$Phase;getProperty(Lyesman/epicfight/api/animation/property/AnimationProperty$AttackPhaseProperty;)Ljava/util/Optional;"),
        remap = false
    )
    private <V> Optional<V> removeArmorNegationModifier(Phase phase, AttackPhaseProperty<V> property) {
        // Возвращаем пустой Optional только для бронепробития – навык не добавит свой модификатор.
        if (property == AttackPhaseProperty.ARMOR_NEGATION_MODIFIER) {
            return Optional.empty();
        }
        // Для DAMAGE_MODIFIER, IMPACT_MODIFIER и всех остальных свойств оставляем как есть.
        return phase.getProperty(property);
    }
}