# 🎮 Game Development

> **By [Tushar Aggarwal](https://www.linkedin.com/in/tusharaggarwalinseec/)** - *Interactive Entertainment Development*
> 
> 🔗 **Connect**: [LinkedIn](https://www.linkedin.com/in/tusharaggarwalinseec/) | Follow for game development insights and best practices

---

## Overview

Game development combines creativity, technical skills, and performance optimization. This guide covers **Unity**, **Unreal Engine**, **HTML5 games**, **mobile optimization**, and **Context Engineering** methodology for creating engaging, scalable gaming experiences.

## 🎯 Unity Game Development

### Modern C# Player Controller

```csharp
// PlayerController.cs - Unity player controller with Netcode
using UnityEngine;
using UnityEngine.InputSystem;
using Unity.Netcode;

[RequireComponent(typeof(CharacterController))]
public class PlayerController : NetworkBehaviour
{
    [Header("Movement")]
    [SerializeField] private float moveSpeed = 5f;
    [SerializeField] private float jumpHeight = 2f;
    [SerializeField] private float gravity = -9.81f;

    [Header("Camera")]
    [SerializeField] private float mouseSensitivity = 100f;
    [SerializeField] private Transform cameraTransform;

    private CharacterController controller;
    private PlayerInput playerInput;
    private Vector3 velocity;
    private bool isGrounded;

    // Network Variables
    private NetworkVariable<Vector3> networkPosition = new();
    private NetworkVariable<float> networkHealth = new(100f);

    // Events
    public static event System.Action<float> OnHealthChanged;

    private void Awake()
    {
        controller = GetComponent<CharacterController>();
        playerInput = GetComponent<PlayerInput>();
        Cursor.lockState = CursorLockMode.Locked;
    }

    public override void OnNetworkSpawn()
    {
        if (!IsOwner)
            playerInput.enabled = false;
    }

    private void Update()
    {
        if (!IsOwner) return;

        HandleMovement();
        HandleMouseLook();
        
        if (IsServer)
            networkPosition.Value = transform.position;
    }

    private void HandleMovement()
    {
        // Ground check
        isGrounded = Physics.CheckSphere(transform.position - Vector3.up * 0.5f, 0.4f);
        if (isGrounded && velocity.y < 0)
            velocity.y = -2f;

        // Movement input
        Vector2 input = playerInput.actions["Move"].ReadValue<Vector2>();
        Vector3 direction = transform.right * input.x + transform.forward * input.y;
        controller.Move(direction * moveSpeed * Time.deltaTime);

        // Jump
        if (playerInput.actions["Jump"].triggered && isGrounded)
            velocity.y = Mathf.Sqrt(jumpHeight * -2f * gravity);

        // Gravity
        velocity.y += gravity * Time.deltaTime;
        controller.Move(velocity * Time.deltaTime);
    }

    private void HandleMouseLook()
    {
        Vector2 mouseDelta = playerInput.actions["Look"].ReadValue<Vector2>();
        transform.Rotate(Vector3.up * mouseDelta.x * mouseSensitivity * Time.deltaTime);
        
        float xRotation = cameraTransform.localEulerAngles.x;
        xRotation -= mouseDelta.y * mouseSensitivity * Time.deltaTime;
        cameraTransform.localRotation = Quaternion.Euler(xRotation, 0f, 0f);
    }

    [ServerRpc]
    public void TakeDamageServerRpc(float damage)
    {
        networkHealth.Value = Mathf.Max(0, networkHealth.Value - damage);
        OnHealthChanged?.Invoke(networkHealth.Value / 100f);
    }
}
```

### Scriptable Object Weapon System

```csharp
// WeaponData.cs - Modular weapon configuration
using UnityEngine;

[CreateAssetMenu(fileName = "New Weapon", menuName = "Game/Weapon")]
public class WeaponData : ScriptableObject
{
    [Header("Properties")]
    public string weaponName;
    public float damage = 25f;
    public float fireRate = 0.5f;
    public float range = 100f;
    public int magazineSize = 30;

    [Header("Effects")]
    public GameObject muzzleFlash;
    public GameObject impactEffect;
    public AudioClip fireSound;
}

// WeaponController.cs - Weapon implementation
using UnityEngine;
using Unity.Netcode;

public class WeaponController : NetworkBehaviour
{
    [SerializeField] private WeaponData weaponData;
    [SerializeField] private Transform firePoint;
    [SerializeField] private Camera playerCamera;

    private NetworkVariable<int> currentAmmo = new();
    private float lastFireTime;

    public override void OnNetworkSpawn()
    {
        if (IsServer)
            currentAmmo.Value = weaponData.magazineSize;
    }

    private void Update()
    {
        if (!IsOwner) return;

        if (Input.GetButton("Fire1") && CanFire())
            FireWeapon();

        if (Input.GetKeyDown(KeyCode.R) && currentAmmo.Value < weaponData.magazineSize)
            ReloadWeapon();
    }

    private bool CanFire()
    {
        return Time.time >= lastFireTime + weaponData.fireRate && currentAmmo.Value > 0;
    }

    private void FireWeapon()
    {
        lastFireTime = Time.time;
        FireServerRpc();
    }

    [ServerRpc]
    private void FireServerRpc()
    {
        currentAmmo.Value--;

        // Raycast for hit detection
        if (Physics.Raycast(playerCamera.transform.position, playerCamera.transform.forward, 
                           out RaycastHit hit, weaponData.range))
        {
            if (hit.collider.TryGetComponent<Health>(out Health health))
                health.TakeDamage(weaponData.damage);

            SpawnEffectsClientRpc(hit.point, hit.normal);
        }

        PlayFireEffectsClientRpc();
    }

    [ClientRpc]
    private void PlayFireEffectsClientRpc()
    {
        if (weaponData.muzzleFlash)
        {
            GameObject flash = Instantiate(weaponData.muzzleFlash, firePoint.position, firePoint.rotation);
            Destroy(flash, 0.1f);
        }

        if (weaponData.fireSound)
            AudioSource.PlayClipAtPoint(weaponData.fireSound, firePoint.position);
    }

    [ClientRpc]
    private void SpawnEffectsClientRpc(Vector3 position, Vector3 normal)
    {
        if (weaponData.impactEffect)
        {
            GameObject impact = Instantiate(weaponData.impactEffect, position, 
                                          Quaternion.LookRotation(normal));
            Destroy(impact, 2f);
        }
    }

    private void ReloadWeapon()
    {
        if (IsServer)
            StartCoroutine(ReloadCoroutine());
        else
            ReloadServerRpc();
    }

    [ServerRpc]
    private void ReloadServerRpc()
    {
        StartCoroutine(ReloadCoroutine());
    }

    private System.Collections.IEnumerator ReloadCoroutine()
    {
        yield return new WaitForSeconds(2f);
        currentAmmo.Value = weaponData.magazineSize;
    }
}
```

## 🏗️ Unreal Engine Development

### C++ Character Class

```cpp
// GameCharacter.h
#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Character.h"
#include "GameCharacter.generated.h"

UCLASS()
class MYGAME_API AGameCharacter : public ACharacter
{
    GENERATED_BODY()

public:
    AGameCharacter();

protected:
    virtual void BeginPlay() override;
    virtual void SetupPlayerInputComponent(UInputComponent* PlayerInputComponent) override;

    // Components
    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
    class USpringArmComponent* SpringArmComponent;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
    class UCameraComponent* CameraComponent;

    // Stats
    UPROPERTY(Replicated, BlueprintReadOnly, Category = "Stats")
    float CurrentHealth = 100.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Stats")
    float MaxHealth = 100.0f;

    // Input
    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Input")
    class UInputAction* MoveAction;

    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Input")
    class UInputAction* LookAction;

    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Input")
    class UInputAction* AttackAction;

public:
    virtual void Tick(float DeltaTime) override;

    UFUNCTION(BlueprintCallable, Category = "Combat")
    void TakeDamage(float DamageAmount);

    UFUNCTION(BlueprintCallable, Category = "Combat")
    void PerformAttack();

    UFUNCTION(Server, Reliable, Category = "Combat")
    void ServerPerformAttack();

private:
    void Move(const struct FInputActionValue& Value);
    void Look(const struct FInputActionValue& Value);
    void Attack();
};
```

## 🌐 HTML5 Game Development

### Phaser 3 Game Scene

```typescript
// GameScene.ts - Phaser 3 game scene
import Phaser from 'phaser';

export class GameScene extends Phaser.Scene {
    private player!: Phaser.Physics.Arcade.Sprite;
    private enemies!: Phaser.Physics.Arcade.Group;
    private bullets!: Phaser.Physics.Arcade.Group;
    private score = 0;
    private scoreText!: Phaser.GameObjects.Text;

    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        this.load.image('player', 'assets/player.png');
        this.load.image('enemy', 'assets/enemy.png');
        this.load.image('bullet', 'assets/bullet.png');
        this.load.audio('shoot', 'assets/shoot.wav');
    }

    create() {
        // Create player
        this.player = this.physics.add.sprite(400, 500, 'player');
        this.player.setCollideWorldBounds(true);

        // Create groups
        this.enemies = this.physics.add.group();
        this.bullets = this.physics.add.group();

        // Setup input
        this.setupInput();

        // Setup collisions
        this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, undefined, this);
        this.physics.add.overlap(this.player, this.enemies, this.playerHit, undefined, this);

        // UI
        this.scoreText = this.add.text(16, 16, 'Score: 0', {
            fontSize: '32px',
            color: '#000'
        });

        // Spawn enemies periodically
        this.time.addEvent({
            delay: 2000,
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true
        });
    }

    private setupInput() {
        const cursors = this.input.keyboard!.createCursorKeys();
        const wasd = this.input.keyboard!.addKeys('W,S,A,D,SPACE');

        this.input.on('pointerdown', this.shoot, this);
        
        // Movement handling in update loop
        this.cursors = cursors;
        this.wasd = wasd;
    }

    update() {
        // Player movement
        const speed = 300;
        
        if (this.cursors.left.isDown || this.wasd.A.isDown) {
            this.player.setVelocityX(-speed);
        } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
            this.player.setVelocityX(speed);
        } else {
            this.player.setVelocityX(0);
        }

        if (this.cursors.up.isDown || this.wasd.W.isDown) {
            this.player.setVelocityY(-speed);
        } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
            this.player.setVelocityY(speed);
        } else {
            this.player.setVelocityY(0);
        }

        // Shooting
        if (this.wasd.SPACE.isDown) {
            this.shoot();
        }

        // Clean up off-screen objects
        this.bullets.children.entries.forEach(bullet => {
            if (bullet.y < 0) bullet.destroy();
        });

        this.enemies.children.entries.forEach(enemy => {
            if (enemy.y > 600) enemy.destroy();
        });
    }

    private shoot() {
        const bullet = this.bullets.create(this.player.x, this.player.y - 20, 'bullet');
        bullet.setVelocityY(-400);
        this.sound.play('shoot', { volume: 0.3 });
    }

    private spawnEnemy() {
        const x = Phaser.Math.Between(50, 750);
        const enemy = this.enemies.create(x, 0, 'enemy');
        enemy.setVelocityY(150);
    }

    private hitEnemy(bullet: Phaser.Physics.Arcade.Sprite, enemy: Phaser.Physics.Arcade.Sprite) {
        bullet.destroy();
        enemy.destroy();
        
        this.score += 10;
        this.scoreText.setText(`Score: ${this.score}`);
    }

    private playerHit() {
        this.scene.restart();
    }
}

// Game configuration
const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: GameScene
};

export const game = new Phaser.Game(config);
```

## 🔧 Context Engineering for Game Development

### System Context Template

```markdown
# Game Development Context Template

## System Context Layer
- Senior Game Developer with engine expertise
- Performance optimization specialist
- Cross-platform development focus
- Player experience and engagement expert

## Domain Context Layer
- Game Engines: Unity, Unreal Engine, Godot
- Programming: C#, C++, JavaScript/TypeScript
- Graphics: Rendering pipelines, shaders, optimization
- Audio: Sound design, music integration, spatial audio
- Networking: Multiplayer, real-time synchronization

## Task Context Layer
- Target platforms (PC, mobile, console, web)
- Performance requirements (FPS, memory, battery)
- Gameplay mechanics and features
- Art style and technical constraints
- Monetization and analytics integration
```

### Performance Optimization Checklist

```markdown
## Unity Optimization
- Use object pooling for frequently spawned objects
- Minimize draw calls with batching
- Optimize textures and use texture atlases
- Profile with Unity Profiler regularly
- Use LOD (Level of Detail) systems

## Unreal Engine Optimization
- Use Blueprint nativization for performance
- Optimize materials and use material instances
- Implement proper LOD and culling
- Use Unreal's built-in profiling tools
- Optimize lighting and shadow settings

## HTML5/WebGL Optimization
- Minimize texture sizes and use compression
- Reduce polygon counts for 3D models
- Use efficient audio formats
- Implement proper garbage collection
- Optimize JavaScript execution
```

## 📚 Key Takeaways

1. **Engine Selection**: Choose the right engine for your target platform and team skills
2. **Performance First**: Optimize early and profile continuously
3. **Modular Design**: Use component-based architecture for flexibility
4. **Network Architecture**: Plan multiplayer systems from the beginning
5. **Player Experience**: Focus on smooth, responsive gameplay
6. **Cross-Platform**: Consider platform-specific optimizations and features

---

**Next**: [Data Science & AI Development →](data-science.md)